import os
import json
import datetime
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
import anthropic

QUERIES = [
    "immigration australia visa site:abc.net.au OR site:smh.com.au OR site:theguardian.com OR site:sbs.com.au",
    "australian visa changes 2026 site:abc.net.au OR site:smh.com.au OR site:theguardian.com OR site:sbs.com.au",
    "home affairs australia migration visa policy",
    "skilled visa australia subclass 2026",
    "immigration australia visa",
    "australian visa changes 2026",
]

NEWS_PATH      = 'news.json'
NEWS_PATH_V2   = 'v2/news.json'
MAX_CANDIDATES = 80   # items sent to Claude for filtering
MAX_FINAL      = 15   # items kept in the final JSON
DAYS_LOOKBACK  = 30   # ignore articles older than this


def fetch_rss(query):
    encoded = urllib.parse.quote(query)
    url = f"https://news.google.com/rss/search?q={encoded}&hl=en-AU&gl=AU&ceid=AU:en"
    req = urllib.request.Request(url, headers={
        'User-Agent': 'Mozilla/5.0 (compatible; CamposNewsBot/1.0)'
    })
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read()


def parse_rss(xml_bytes):
    root = ET.fromstring(xml_bytes)
    channel = root.find('channel')
    items = []
    for item in channel.findall('item'):
        title   = item.findtext('title', '').strip()
        link    = item.findtext('link', '').strip()
        pub     = item.findtext('pubDate', '').strip()
        source  = item.findtext('source', '').strip()

        try:
            dt = datetime.datetime.strptime(pub, '%a, %d %b %Y %H:%M:%S %Z')
            date_iso = dt.strftime('%Y-%m-%d')
        except Exception:
            date_iso = ''

        items.append({
            'title':  title,
            'link':   link,
            'date':   date_iso,
            'source': source,
        })
    return items


def is_recent(date_iso):
    if not date_iso:
        return True
    try:
        dt = datetime.datetime.strptime(date_iso, '%Y-%m-%d')
        age = (datetime.datetime.utcnow() - dt).days
        return age <= DAYS_LOOKBACK
    except Exception:
        return True


def deduplicate(items):
    seen_links  = set()
    seen_titles = set()
    result = []
    for item in items:
        title_key = item['title'].lower()[:60]
        if item['link'] not in seen_links and title_key not in seen_titles:
            seen_links.add(item['link'])
            seen_titles.add(title_key)
            result.append(item)
    return result


def filter_and_annotate(items):
    client = anthropic.Anthropic()

    lines = "\n".join(
        f"{i+1}. [{item['source']}] {item['title']} ({item['date']})"
        for i, item in enumerate(items)
    )

    prompt = f"""You are an expert in Australian immigration law.

Below are {len(items)} recent news headlines. Your task:

1. Select up to {MAX_FINAL} headlines that are DIRECTLY about Australian immigration. Include only items that clearly involve: Australian visa policy, processing times, fee changes, new or cancelled visa subclasses, Australian migration law changes, skilled migration to Australia, partner visas, Australian citizenship, or decisions by the Australian Department of Home Affairs. EXCLUDE: news about other countries' immigration systems, generic world news that only tangentially mentions Australia, or articles where Australia appears only as a passing reference.

   SOURCE PREFERENCE: Strongly prefer articles from reputable Australian outlets such as ABC News (abc.net.au), The Sydney Morning Herald (smh.com.au), The Guardian Australia (theguardian.com), SBS News (sbs.com.au), The Age, or The Australian. If two articles cover the same topic, select the one from the more reputable Australian source.

2. For each selected item write a 2–3 sentence commentary in English that:
   - Explains what the news means in plain language
   - Highlights the practical impact for people with or seeking Australian visas
   - Is factual and professional — do NOT mention specific locations, law firms, or give legal advice

3. Assign one category: "Visas", "Law & Policy", "Work Visas", "Student Visas", "Permanent Residency", or "General"

Headlines:
{lines}

Respond ONLY with a valid JSON array — no markdown, no extra text:
[
  {{"index": <1-based>, "category": "<category>", "commentary": "<text>"}},
  ...
]"""

    message = client.messages.create(
        model="claude-opus-4-8",
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}]
    )

    raw = message.content[0].text.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    selected = json.loads(raw)

    result = []
    for sel in selected:
        idx = int(sel["index"]) - 1
        if 0 <= idx < len(items):
            entry = items[idx].copy()
            entry["category"]   = sel["category"]
            entry["commentary"] = sel["commentary"]
            result.append(entry)

    return result


if __name__ == "__main__":
    print("Fetching news from Google News RSS...")
    all_items = []
    for query in QUERIES:
        print(f"  → {query}")
        try:
            xml_bytes = fetch_rss(query)
            items = parse_rss(xml_bytes)
            all_items.extend(items)
            print(f"    {len(items)} items")
        except Exception as e:
            print(f"    ERROR: {e}")

    unique = deduplicate(all_items)
    recent = [i for i in unique if is_recent(i["date"])]
    recent.sort(key=lambda x: x["date"], reverse=True)
    candidates = recent[:MAX_CANDIDATES]
    print(f"\nCandidates: {len(candidates)} unique recent items")

    print("Filtering and annotating with Claude...")
    annotated = filter_and_annotate(candidates)
    print(f"Selected {len(annotated)} relevant items")

    output = {
        "updated": datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
        "items": annotated,
    }

    for path in (NEWS_PATH, NEWS_PATH_V2):
        os.makedirs(os.path.dirname(path) if os.path.dirname(path) else ".", exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(output, f, ensure_ascii=False, indent=2)
        print(f"Saved {path}")
