"""
Medicine data scraper for medex.com.bd
Uses requests + BeautifulSoup — no browser required.

Usage:
    pip install -r requirements.txt
    python scrape.py

Outputs:
    ../public/data/medicines-index.json   — lean index (slug, name, strength, generic, manufacturer, local image path)
    ../public/data/medicines/{slug}.md    — per-medicine sections in ## Heading format
    ../public/images/medicines/{slug}.webp — downloaded medicine images
    ./checkpoint.json                     — resume support (deleted on clean finish)
"""

import json
import os
import re
import time
import random
import sys
from pathlib import Path

import requests
from bs4 import BeautifulSoup, NavigableString

# ── Paths ─────────────────────────────────────────────────────────────────
BASE_DIR        = Path(__file__).parent
INDEX_FILE      = BASE_DIR / ".." / "public" / "data" / "medicines-index.json"
MD_DIR          = BASE_DIR / ".." / "public" / "data" / "medicines"
IMAGES_DIR      = BASE_DIR / ".." / "public" / "images" / "medicines"
CHECKPOINT_FILE = BASE_DIR / "checkpoint.json"

# ── Tunables ──────────────────────────────────────────────────────────────
BASE_URL    = "https://medex.com.bd"
MAX_PAGES   = 2        # brand-list pages to scrape
RETRY_LIMIT = 3        # attempts per URL before giving up
RETRY_DELAY = 3.0      # base seconds between retries (doubles each attempt)
PAGE_DELAY  = 2.5      # base seconds between successive medicine requests

# ── Anti-blocking: rotate through common desktop user-agents ──────────────
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
]


def random_user_agent() -> str:
    return random.choice(USER_AGENTS)


def jitter_delay(base: float = PAGE_DELAY) -> float:
    """Return base ± 30 % so requests don't look perfectly metronomic."""
    spread = base * 0.3
    return base + random.uniform(-spread, spread)


def slugify(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


# ── HTTP session ──────────────────────────────────────────────────────────

def make_session() -> requests.Session:
    session = requests.Session()
    session.headers.update({
        "User-Agent": random_user_agent(),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
    })
    return session


def fetch_with_retry(session: requests.Session, url: str, timeout: int = 30) -> requests.Response:
    """GET *url* with up to RETRY_LIMIT attempts and exponential back-off."""
    last_err = None
    for attempt in range(1, RETRY_LIMIT + 1):
        try:
            # Rotate the user-agent on every attempt
            session.headers["User-Agent"] = random_user_agent()
            response = session.get(url, timeout=timeout)
            response.raise_for_status()
            return response
        except (requests.RequestException, OSError) as err:
            last_err = err
            if attempt < RETRY_LIMIT:
                wait = RETRY_DELAY * (2 ** (attempt - 1))   # 3 s → 6 s → 12 s
                print(
                    f"  ⚠ Attempt {attempt}/{RETRY_LIMIT} failed for {url} "
                    f"({err}) — retrying in {wait:.0f}s…"
                )
                time.sleep(wait)
    raise last_err


# ── Checkpoint helpers ─────────────────────────────────────────────────────

def load_checkpoint() -> dict:
    try:
        if CHECKPOINT_FILE.exists():
            return json.loads(CHECKPOINT_FILE.read_text("utf-8"))
    except Exception:
        pass
    return {"done": []}


def save_checkpoint(checkpoint: dict) -> None:
    CHECKPOINT_FILE.write_text(json.dumps(checkpoint, indent=2), encoding="utf-8")


# ── Output helpers ─────────────────────────────────────────────────────────

def load_existing_data() -> list:
    try:
        if INDEX_FILE.exists():
            return json.loads(INDEX_FILE.read_text("utf-8"))
    except Exception:
        pass
    return []


def save_index(data: list) -> None:
    INDEX_FILE.parent.mkdir(parents=True, exist_ok=True)
    INDEX_FILE.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")


def write_md(slug: str, sections: dict) -> None:
    """Write per-medicine sections to a .md file in ## Heading\nContent format."""
    MD_DIR.mkdir(parents=True, exist_ok=True)
    parts = [f"## {title}\n{body}" for title, body in sections.items()]
    (MD_DIR / f"{slug}.md").write_text("\n\n".join(parts), encoding="utf-8")


def download_image(session: requests.Session, image_url: str, slug: str):
    """Download medicine image locally; returns the local public path or None."""
    if not image_url:
        return None
    # Inline data URIs (e.g. lazy-load placeholder SVGs) cannot be fetched via HTTP
    if image_url.startswith("data:"):
        return None
    url_path = image_url.split("?")[0]
    ext = os.path.splitext(url_path)[1] or ".webp"
    filename = f"{slug}{ext}"
    local_path = IMAGES_DIR / filename
    if local_path.exists():
        return f"/images/medicines/{filename}"
    try:
        resp = fetch_with_retry(session, image_url)
        IMAGES_DIR.mkdir(parents=True, exist_ok=True)
        local_path.write_bytes(resp.content)
        print(f"    📷 Image saved: {filename}")
        return f"/images/medicines/{filename}"
    except Exception as e:
        print(f"    ⚠ Image download failed: {e}")
        return image_url  # fall back to remote URL


# ── HTML parsing ───────────────────────────────────────────────────────────

def parse_brand_list(html: str) -> list[dict]:
    """Extract medicine stub info from a brands page."""
    soup = BeautifulSoup(html, "lxml")
    items = []
    for el in soup.select("a.hoverable-block"):
        name_el     = el.select_one(".data-row-top")
        strength_el = el.select_one(".data-row-strength")
        generic_el  = (
            strength_el.parent.find_next_sibling()
            if strength_el and strength_el.parent else None
        )
        company_el  = el.select_one(".data-row-company")

        href = el.get("href", "")
        if href and not href.startswith("http"):
            href = BASE_URL + href

        items.append({
            "url":      href,
            "name":     name_el.get_text(strip=True)     if name_el     else "",
            "strength": strength_el.get_text(strip=True) if strength_el else "",
            "generic":  generic_el.get_text(strip=True)  if generic_el  else "",
            "company":  company_el.get_text(strip=True)  if company_el  else "",
        })
    return items


def extract_text(node) -> str:
    """
    Recursively extract formatted text from a BeautifulSoup node,
    mirroring the extractText() function in the original JS scraper.
    """
    result = []
    for child in node.children:
        if isinstance(child, NavigableString):
            text = child.strip()
            if text:
                result.append(text + " ")
        elif child.name == "br":
            result.append("\n")
        elif child.name == "ul":
            for li in child.find_all("li"):
                result.append(f"\n- {li.get_text(strip=True)}")
            result.append("\n")
        elif child.name == "ol":
            for i, li in enumerate(child.find_all("li"), 1):
                result.append(f"\n{i}. {li.get_text(strip=True)}")
            result.append("\n")
        elif child.name == "strong":
            result.append(child.get_text(strip=True) + " ")
        else:
            inner = child.get_text(strip=True)
            if inner:
                result.append(inner + " ")
    return "".join(result).strip()


def parse_detail_page(html: str) -> dict:
    """Extract section data and image from a medicine detail page."""
    soup = BeautifulSoup(html, "lxml")

    sections = {}
    for header in soup.select(".ac-header"):
        title = header.get_text(strip=True)
        body  = header.parent.find_next_sibling()
        if body and "ac-body" in (body.get("class") or []):
            sections[title] = extract_text(body)

    image = None
    mp = soup.select_one(".mp-trigger")
    if mp:
        image = mp.get("href")
    if not image:
        img = soup.select_one(".img-defer")
        if img:
            # Prefer lazy-load attributes over src (src is often a placeholder data URI)
            image = (
                img.get("data-src")
                or img.get("data-original")
                or img.get("data-lazy-src")
                or img.get("src")
            )
            # Discard inline data URIs — they are placeholder SVGs, not real images
            if image and image.startswith("data:"):
                image = None

    return {"sections": sections, "image": image}


# ── Main scraper ───────────────────────────────────────────────────────────

def scrape() -> None:
    checkpoint = load_checkpoint()
    results    = load_existing_data()
    done_set   = set(checkpoint["done"])

    print(f"Resuming: {len(done_set)} medicines already scraped.")

    session = make_session()

    for page_num in range(1, MAX_PAGES + 1):
        url = f"{BASE_URL}/brands?page={page_num}"
        print(f"\nFetching brand list page {page_num}: {url}")

        response = fetch_with_retry(session, url)
        items    = parse_brand_list(response.text)
        print(f"  Found {len(items)} medicines on page {page_num}")

        for item in items:
            slug = slugify(item["name"] or item["url"])

            if slug in done_set:
                print(f"  ↩ Skip (already scraped): {item['name']}")
                continue

            print(f"  → Scraping: {item['name']}")
            scraped = False

            for attempt in range(1, RETRY_LIMIT + 1):
                try:
                    detail_response = fetch_with_retry(session, item["url"])
                    data = parse_detail_page(detail_response.text)

                    # Verify we got something useful
                    if not data["sections"]:
                        raise ValueError("No sections found — page content may be invalid or empty")

                    results.append({
                        "slug":         slug,
                        "name":         item["name"],
                        "strength":     item["strength"],
                        "generic":      item["generic"],
                        "manufacturer": item["company"],
                        "image":        download_image(session, data["image"], slug),
                    })

                    write_md(slug, data["sections"])

                    done_set.add(slug)
                    checkpoint["done"] = list(done_set)
                    save_index(results)
                    save_checkpoint(checkpoint)

                    print(f"    ✓ Saved: {item['name']}")
                    scraped = True
                    break

                except Exception as err:
                    if attempt < RETRY_LIMIT:
                        wait = RETRY_DELAY * (2 ** (attempt - 1))
                        print(
                            f"    ⚠ Attempt {attempt}/{RETRY_LIMIT} failed: "
                            f"{err} — retrying in {wait:.0f}s…"
                        )
                        time.sleep(wait)
                    else:
                        print(
                            f"    ✗ Gave up after {RETRY_LIMIT} attempts: "
                            f"{item['name']} — {err}"
                        )

            # Jittered delay between medicines to avoid rate-limiting
            if scraped:
                time.sleep(jitter_delay())

    print(f"\nDone. {len(results)} medicines written to {INDEX_FILE}")

    # Remove checkpoint on clean completion so next full run starts fresh
    if CHECKPOINT_FILE.exists():
        CHECKPOINT_FILE.unlink()


if __name__ == "__main__":
    try:
        scrape()
    except KeyboardInterrupt:
        print("\nInterrupted — progress saved to checkpoint.")
        sys.exit(0)
    except Exception as err:
        print(f"Fatal scraper error: {err}", file=sys.stderr)
        sys.exit(1)
