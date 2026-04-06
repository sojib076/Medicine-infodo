"""
remove_watermark.py — Remove the MedEx logo/watermark from medicine images.

Strategy (applied in priority order for each image):
  1. Corner scan + targeted OCR  — look for "MedEx"/"medex" text in the four
     corners (where watermarks almost always live); inpaint only those boxes,
     expanded to cover the icon portion.
  2. Full-image OCR fallback     — if no MedEx text found in corners, run OCR
     on the entire image and inpaint any box whose text matches the watermark.
  3. HSV colour mask             — detect the distinctive MedEx blue/cyan colour
     in corner regions and inpaint any significant connected blob.

All three passes are combined into a single mask before inpainting, so the
operation is done in one step per image.

Requires Python 3.7+ (uses ``from __future__ import annotations`` for PEP 563
forward-reference annotations so the type hints are compatible with 3.7/3.8).

Usage:
    pip install -r requirements.txt
    python remove_watermark.py [--input images] [--output output] [--workers 4]

    # or process the scraped images in-place (backs them up first):
    python remove_watermark.py --input ../public/images/medicines \
                               --output ../public/images/medicines \
                               --inplace
"""

from __future__ import annotations

import argparse
import os
import sys
import shutil
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List, Tuple

import cv2
import numpy as np

try:
    import pytesseract
    _TESSERACT_AVAILABLE = True
except ImportError:
    _TESSERACT_AVAILABLE = False
    print("⚠  pytesseract not installed — OCR-based detection disabled. "
          "Only colour-mask detection will be used.")

try:
    from tqdm import tqdm
    _TQDM_AVAILABLE = True
except ImportError:
    _TQDM_AVAILABLE = False


# ── Tunables ─────────────────────────────────────────────────────────────────

# Fraction of image size used as "corner" region for fast targeted scanning
CORNER_FRACTION = 0.30

# OCR confidence threshold — only keep boxes with conf >= this value
OCR_CONF_THRESHOLD = 40

# Inpainting radius (pixels).  Larger = smoother but slower.
INPAINT_RADIUS = 5

# Minimum area (pixels²) of a colour blob to be considered part of the logo
MIN_BLOB_AREA = 80

# How much (pixels) to expand each detected bounding box on each side so the
# inpainter also covers any adjacent icon/graphic element around the text.
BOX_PADDING = 6

# MedEx HSV colour range (the logo uses a distinctive cyan-blue)
# Tune these if the logo colour differs in your image set.
MEDEX_HSV_LOWER = np.array([85,  60,  80])
MEDEX_HSV_UPPER = np.array([130, 255, 255])

# Keywords that identify the watermark text (case-insensitive, partial match)
WATERMARK_KEYWORDS = {"medex", "medex.com", "medex.com.bd"}

# Image extensions we will process
IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".webp", ".bmp"}


# ── Helpers ──────────────────────────────────────────────────────────────────

def _expand_box(x: int, y: int, w: int, h: int, pad: int,
                img_w: int, img_h: int) -> Tuple[int, int, int, int]:
    """Expand a bounding box by *pad* pixels, clamped to image bounds."""
    x1 = max(0, x - pad)
    y1 = max(0, y - pad)
    x2 = min(img_w, x + w + pad)
    y2 = min(img_h, y + h + pad)
    return x1, y1, x2 - x1, y2 - y1


def _corner_rects(img_h: int, img_w: int) -> List[Tuple[int, int, int, int]]:
    """
    Return four (x, y, w, h) rectangles covering the corners of an image,
    each CORNER_FRACTION of the image dimensions in size.
    """
    ch = int(img_h * CORNER_FRACTION)
    cw = int(img_w * CORNER_FRACTION)
    return [
        (0,          0,          cw, ch),   # top-left
        (img_w - cw, 0,          cw, ch),   # top-right
        (0,          img_h - ch, cw, ch),   # bottom-left
        (img_w - cw, img_h - ch, cw, ch),   # bottom-right
    ]


def _is_watermark_text(text: str) -> bool:
    """Return True if *text* contains any watermark keyword."""
    lower = text.lower().strip()
    return any(kw in lower for kw in WATERMARK_KEYWORDS)


def _parse_confidence(value: object) -> int:
    """
    Parse a Tesseract confidence value to int, returning -1 on failure.

    Tesseract returns conf as a string (e.g. ``"87"``, ``"-1"``).  This helper
    centralises the parsing so the OCR loop stays readable.
    """
    try:
        return int(str(value))
    except (ValueError, TypeError):
        return -1


# ── Detection passes ─────────────────────────────────────────────────────────

def _ocr_detect(gray: np.ndarray, roi_rects: List[Tuple[int, int, int, int]],
                img_h: int, img_w: int) -> np.ndarray:
    """
    Run Tesseract OCR on *roi_rects* (or the full image if empty), build and
    return a binary mask for boxes whose text matches the watermark keywords.
    """
    mask = np.zeros((img_h, img_w), np.uint8)
    if not _TESSERACT_AVAILABLE:
        return mask

    config = "--oem 3 --psm 11"  # sparse text — good for overlays/logos

    for (rx, ry, rw, rh) in roi_rects:
        roi = gray[ry: ry + rh, rx: rx + rw]
        try:
            data = pytesseract.image_to_data(
                roi, config=config, output_type=pytesseract.Output.DICT
            )
        except Exception:
            continue

        n = len(data["level"])
        for i in range(n):
            text = (data["text"][i] or "").strip()
            conf = _parse_confidence(data["conf"][i])
            if not text or conf < OCR_CONF_THRESHOLD:
                continue
            if not _is_watermark_text(text):
                continue
            bx = data["left"][i] + rx
            by = data["top"][i] + ry
            bw = data["width"][i]
            bh = data["height"][i]
            ex, ey, ew, eh = _expand_box(bx, by, bw, bh, BOX_PADDING, img_w, img_h)
            cv2.rectangle(mask, (ex, ey), (ex + ew, ey + eh), 255, -1)

    return mask


def _colour_detect(hsv: np.ndarray, roi_rects: List[Tuple[int, int, int, int]],
                   img_h: int, img_w: int) -> np.ndarray:
    """
    Detect the MedEx logo by its distinctive HSV colour within *roi_rects*.
    Returns a binary mask covering significant blobs of that colour.
    """
    mask = np.zeros((img_h, img_w), np.uint8)
    colour_mask = cv2.inRange(hsv, MEDEX_HSV_LOWER, MEDEX_HSV_UPPER)

    for (rx, ry, rw, rh) in roi_rects:
        roi_colour = colour_mask[ry: ry + rh, rx: rx + rw]

        # Find connected components of the logo colour
        n_labels, labels, stats, _ = cv2.connectedComponentsWithStats(
            roi_colour, connectivity=8
        )
        for label in range(1, n_labels):  # skip background (0)
            area = stats[label, cv2.CC_STAT_AREA]
            if area < MIN_BLOB_AREA:
                continue
            bx = stats[label, cv2.CC_STAT_LEFT] + rx
            by = stats[label, cv2.CC_STAT_TOP]  + ry
            bw = stats[label, cv2.CC_STAT_WIDTH]
            bh = stats[label, cv2.CC_STAT_HEIGHT]
            ex, ey, ew, eh = _expand_box(bx, by, bw, bh, BOX_PADDING, img_w, img_h)
            cv2.rectangle(mask, (ex, ey), (ex + ew, ey + eh), 255, -1)

    return mask


# ── Main processing ───────────────────────────────────────────────────────────

def remove_watermark(img: np.ndarray) -> Tuple[np.ndarray, bool]:
    """
    Detect and remove the MedEx watermark from *img*.

    Returns ``(cleaned_image, watermark_was_found)``.
    The original image is returned unchanged if nothing was detected.
    """
    img_h, img_w = img.shape[:2]
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    hsv  = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

    corners = _corner_rects(img_h, img_w)

    # Pass 1: OCR on corners only
    mask = _ocr_detect(gray, corners, img_h, img_w)

    # Pass 2: if OCR found nothing in corners, try the full image
    if _TESSERACT_AVAILABLE and cv2.countNonZero(mask) == 0:
        full_rect = [(0, 0, img_w, img_h)]
        mask = _ocr_detect(gray, full_rect, img_h, img_w)

    # Pass 3: colour-based detection in corners (always applied, OR'd into mask)
    colour_mask = _colour_detect(hsv, corners, img_h, img_w)
    mask = cv2.bitwise_or(mask, colour_mask)

    if cv2.countNonZero(mask) == 0:
        return img, False  # nothing found — return original

    # Slight morphological closing to fill small gaps within a logo area
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)

    cleaned = cv2.inpaint(img, mask, INPAINT_RADIUS, cv2.INPAINT_TELEA)
    return cleaned, True


def process_image(src: Path, dst: Path, inplace: bool) -> str:
    """
    Process a single image file.  Returns a status string for logging.
    """
    if dst.exists() and not inplace:
        return f"skip: {src.name} (already exists)"

    img = cv2.imread(str(src), cv2.IMREAD_UNCHANGED)
    if img is None:
        return f"error: {src.name} (unreadable)"

    # Normalise: always work in BGR (strip alpha if present)
    if img.ndim == 2:
        img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
    elif img.shape[2] == 4:
        img = cv2.cvtColor(img, cv2.COLOR_BGRA2BGR)

    cleaned, found = remove_watermark(img)

    dst.parent.mkdir(parents=True, exist_ok=True)

    # For WebP, force lossless-like high quality to preserve medicine details
    ext = dst.suffix.lower()
    encode_params: List[int] = []
    if ext == ".webp":
        encode_params = [cv2.IMWRITE_WEBP_QUALITY, 95]
    elif ext in {".jpg", ".jpeg"}:
        encode_params = [cv2.IMWRITE_JPEG_QUALITY, 95]

    cv2.imwrite(str(dst), cleaned, encode_params)
    status = "cleaned" if found else "no watermark"
    return f"{status}: {src.name}"


# ── CLI ───────────────────────────────────────────────────────────────────────

def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Remove MedEx logo/watermark from medicine images."
    )
    parser.add_argument(
        "--input", "-i",
        default="images",
        help="Folder containing source images (default: images/)",
    )
    parser.add_argument(
        "--output", "-o",
        default="output",
        help="Folder for processed images (default: output/)",
    )
    parser.add_argument(
        "--inplace",
        action="store_true",
        help="Overwrite source images in --input (creates .bak copies first)",
    )
    parser.add_argument(
        "--workers", "-w",
        type=int,
        default=1,
        help="Number of parallel worker threads (default: 1). "
             "Set to 0 to use all CPU cores.",
    )
    return parser.parse_args()


def iter_images(folder: Path):
    """Yield all image paths in *folder* (non-recursive)."""
    for p in sorted(folder.iterdir()):
        if p.is_file() and p.suffix.lower() in IMAGE_EXTS:
            yield p


def main() -> None:
    args = parse_args()

    input_dir  = Path(args.input)
    output_dir = Path(args.output)

    if not input_dir.is_dir():
        print(f"Error: input folder not found: {input_dir}", file=sys.stderr)
        sys.exit(1)

    if args.inplace:
        # Back up originals into a sibling  <input>_originals/ folder
        backup_dir = input_dir.parent / (input_dir.name + "_originals")
        backup_dir.mkdir(parents=True, exist_ok=True)
        print(f"In-place mode: originals backed up to {backup_dir}/")
    else:
        output_dir.mkdir(parents=True, exist_ok=True)

    image_paths = list(iter_images(input_dir))
    if not image_paths:
        print(f"No images found in {input_dir}")
        return

    print(f"Processing {len(image_paths)} image(s) …")

    n_workers = args.workers if args.workers > 0 else os.cpu_count() or 1

    counts = {"cleaned": 0, "no watermark": 0, "skip": 0, "error": 0}

    def _task(src: Path) -> str:
        if args.inplace:
            # Backup then overwrite
            bak = backup_dir / src.name
            if not bak.exists():
                shutil.copy2(src, bak)
            dst = src
        else:
            dst = output_dir / src.name
        return process_image(src, dst, inplace=args.inplace)

    if n_workers == 1:
        iterator = image_paths
        if _TQDM_AVAILABLE:
            iterator = tqdm(image_paths, unit="img")
        for src in iterator:
            result = _task(src)
            key = result.split(":", 1)[0]
            counts[key] = counts.get(key, 0) + 1
            if not _TQDM_AVAILABLE:
                print(f"  {result}")
    else:
        print(f"Using {n_workers} worker threads.")
        with ThreadPoolExecutor(max_workers=n_workers) as pool:
            futures = {pool.submit(_task, src): src for src in image_paths}
            if _TQDM_AVAILABLE:
                futures_iter = tqdm(as_completed(futures), total=len(futures), unit="img")
            else:
                futures_iter = as_completed(futures)
            for fut in futures_iter:
                result = fut.result()
                key = result.split(":", 1)[0]
                counts[key] = counts.get(key, 0) + 1
                if not _TQDM_AVAILABLE:
                    print(f"  {result}")

    print(
        f"\nDone.  "
        f"cleaned={counts.get('cleaned', 0)}  "
        f"no_watermark={counts.get('no watermark', 0)}  "
        f"skipped={counts.get('skip', 0)}  "
        f"errors={counts.get('error', 0)}"
    )
    if not args.inplace:
        print(f"Output saved to: {output_dir}/")


if __name__ == "__main__":
    main()
