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

# Sources blocked regardless of content — non-Australian publications
BLOCKED_SOURCES = frozenset([
    'vietnam investment review', 'vir',
    'indian express', 'business standard',
    'times of india', 'hindustan times', 'ndtv',
    'india today', 'moneycontrol', 'financial express',
    'the hans india', 'livemint', 'economic times',
    'fragomen',          # immigration consultancy, not journalism
    'daily sabah',       # Turkish
    'manila bulletin', 'philippine daily',
    'the nation thailand',
    'gulf news', 'khaleej times',
])


def is_blocked_source(source_name: str) -> bool:
    name = source_name.lower()
    return any(blocked in name for blocked in BLOCKED_SOURCES)


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
        title = item.findtext('title', '').strip()
        link  = item.findtext('link', '').strip()
        pub   = item.findtext('pubDate', '').strip()

        source_elem = item.find('source')
        if source_elem is not None:
            source     = (source_elem.text or '').strip()
            source_url = source_elem.get('url', '')
        else:
            source     = ''
            source_url = ''

        try:
            dt = datetime.datetime.strptime(pub, '%a, %d %b %Y %H:%M:%S %Z')
            date_iso = dt.strftime('%Y-%m-%d')
        except Exception:
            date_iso = ''

        items.append({
            'title':      title,
            'link':       link,
            'date':       date_iso,
            'source':     source,
            'source_url': source_url,
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

    prompt = f"""You are a factual news editor specialising in Australian immigration.

Below are {len(items)} recent news headlines. Your task:

1. Select up to {MAX_FINAL} headlines that are DIRECTLY about Australian immigration. Include only items that clearly involve: Australian visa policy, processing times, fee changes, new or cancelled visa subclasses, Australian migration law changes, skilled migration to Australia, partner visas, Australian citizenship, or decisions by the Australian Department of Home Affairs.

   EXCLUDE:
   - News about other countries' immigration systems (e.g. Vietnam, India, US, UK, Canada)
   - Generic world news that only tangentially mentions Australia
   - Articles from non-Australian publications where Australia is not the primary focus
   - Press releases or content from immigration consultancy firms (e.g. Fragomen)

   SOURCE PREFERENCE: Strongly prefer articles from reputable Australian outlets — ABC News, The Sydney Morning Herald, The Guardian Australia, SBS News, The Age, The Australian, News.com.au, AFR. If two articles cover the same topic, select the one from the more credible Australian source.

2. For each selected item write a 2-sentence factual summary in BOTH English and Brazilian Portuguese (pt-BR) that:
   - States what happened or what changed, in plain language
   - Explains the practical impact for people with or seeking Australian visas
   - Is completely neutral — do NOT frame it as commentary from any law firm, adviser, or organisation
   - Does NOT mention specific cities, firm names, or give legal advice
   - Is concise enough to display in full without truncation (aim for ~60 words per language)
   - The Portuguese version must be a natural translation — not word-for-word, but clear and idiomatic pt-BR

3. Assign one category: "Visas", "Law & Policy", "Work Visas", "Student Visas", "Permanent Residency", or "General"

Headlines:
{lines}

Respond ONLY with a valid JSON array — no markdown, no extra text:
[
  {{"index": <1-based>, "category": "<category>", "commentary": "<English summary>", "commentary_pt": "<Portuguese summary>"}},
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
            entry.pop('source_url', None)   # don't expose internal field
            entry["category"]    = sel["category"]
            entry["commentary"]    = sel["commentary"]
            entry["commentary_pt"] = sel.get("commentary_pt", "")
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

    # Remove blocked non-Australian sources before sending to Claude
    filtered = [i for i in recent if not is_blocked_source(i.get('source', ''))]
    print(f"\nAfter source filter: {len(filtered)} / {len(recent)} items kept")

    filtered.sort(key=lambda x: x["date"], reverse=True)
    candidates = filtered[:MAX_CANDIDATES]
    print(f"Candidates: {len(candidates)} unique recent items")

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
