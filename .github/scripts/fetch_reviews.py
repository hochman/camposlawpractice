#!/usr/bin/env python3
"""
Fetches 5-star Google reviews for Campos Law Practice via Google Places API.
- Merges with existing reviews.json (keeps history beyond the 5-review API limit)
- Downloads profile photos to v2/img/reviews/
- Keeps the 15 most recent 5-star reviews, sorted newest first
"""

import json
import os
import re
import urllib.request
from datetime import datetime

API_KEY  = os.environ['GOOGLE_PLACES_API_KEY']
PLACE_ID = os.environ['PLACE_ID']

REVIEWS_PATH     = 'v2/reviews.json'
REVIEWS_PATH_ROOT = 'reviews.json'
REVIEWS_IMG      = 'v2/img/reviews'
REVIEWS_IMG_ROOT = 'img/reviews'
MAX_REVIEWS      = 15

os.makedirs(REVIEWS_IMG, exist_ok=True)
os.makedirs(REVIEWS_IMG_ROOT, exist_ok=True)

# ── Fetch from Google Places API ──────────────────────────────────────────────
url = (
    'https://maps.googleapis.com/maps/api/place/details/json'
    f'?place_id={PLACE_ID}'
    '&fields=reviews'
    f'&key={API_KEY}'
    '&reviews_sort=newest'
)
with urllib.request.urlopen(url) as resp:
    data = json.loads(resp.read())

status = data.get('status')
if status != 'OK':
    print(f'API error: {status} — {data.get("error_message", "")}')

api_reviews = data.get('result', {}).get('reviews', [])
print(f'API returned {len(api_reviews)} reviews')

# ── Load existing reviews ──────────────────────────────────────────────────────
with open(REVIEWS_PATH, encoding='utf-8') as f:
    existing = json.load(f)

def review_key(r):
    """Unique key to detect duplicates."""
    return r['name'].lower().strip() + '|' + (r.get('review') or '')[:40].lower().strip()

existing_keys = {review_key(r) for r in existing}

# ── Process new reviews from API ───────────────────────────────────────────────
added = 0
for r in api_reviews:
    if r.get('rating') != 5:
        continue

    name   = r['author_name']
    text   = r.get('text', '')
    date   = datetime.fromtimestamp(r['time']).strftime('%Y-%m-%d')
    link   = r.get('author_url', '')
    photo  = r.get('profile_photo_url', '')

    key = (name.lower().strip() + '|' + text[:40].lower().strip())
    if key in existing_keys:
        continue

    # Download profile photo to both v2 and root
    img_filename = None
    if photo:
        safe = re.sub(r'[^a-z0-9]+', '-', name.lower())[:30].strip('-')
        try:
            urllib.request.urlretrieve(photo, os.path.join(REVIEWS_IMG, f'{safe}.jpg'))
            urllib.request.urlretrieve(photo, os.path.join(REVIEWS_IMG_ROOT, f'{safe}.jpg'))
            img_filename = f'reviews/{safe}.jpg'
        except Exception as e:
            print(f'  Could not download photo for {name}: {e}')

    existing.append({
        'name':   name,
        'link':   link,
        'stars':  5,
        'review': text,
        'date':   date,
        'image':  img_filename,
    })
    existing_keys.add(key)
    added += 1
    print(f'  + Added: {name} ({date})')

# ── Filter, sort, trim ─────────────────────────────────────────────────────────
result = [r for r in existing if r.get('stars') == 5]
result.sort(key=lambda r: r.get('date') or '', reverse=True)
result = result[:MAX_REVIEWS]

for path in (REVIEWS_PATH, REVIEWS_PATH_ROOT):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

print(f'Done: {added} new review(s) added — {len(result)} total in reviews.json')
