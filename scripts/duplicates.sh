#!/bin/bash
# Usage: ./duplicates.sh <dir> [threshold]
# Finds visually similar/duplicate images using perceptual hashing (dHash).
# threshold: hamming distance 0-64, default 6 (lower = more strict)
#            0 = exact visual duplicates only
# Requires: Python 3 + Pillow  (pip install Pillow)

DIR="${1:?'Usage: ./duplicates.sh <dir> [threshold]'}"
THRESHOLD="${2:-6}"

if ! command -v python3 >/dev/null; then
  echo "Error: python3 not found."
  exit 1
fi

python3 - "$DIR" "$THRESHOLD" <<'PYEOF'
import sys, os
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Error: Pillow not installed. Run: pip install Pillow", file=sys.stderr)
    sys.exit(1)

EXTS = {'.png', '.jpg', '.jpeg', '.webp', '.gif'}

def dhash(path, size=8):
    try:
        img = Image.open(path).convert('L').resize((size + 1, size), Image.LANCZOS)
        pixels = list(img.getdata())
        bits = [1 if pixels[r * (size+1) + c] > pixels[r * (size+1) + c + 1] else 0
                for r in range(size) for c in range(size)]
        return sum(b << i for i, b in enumerate(bits))
    except Exception:
        return None

def hamming(a, b):
    return bin(a ^ b).count('1')

directory = Path(sys.argv[1])
threshold = int(sys.argv[2])

files = [f for f in sorted(directory.rglob('*')) if f.suffix.lower() in EXTS]
print(f"Hashing {len(files)} images...")

hashes = {}
for f in files:
    h = dhash(f)
    if h is not None:
        hashes[f] = h

pairs = []
file_list = list(hashes.items())
for i in range(len(file_list)):
    for j in range(i + 1, len(file_list)):
        fa, ha = file_list[i]
        fb, hb = file_list[j]
        dist = hamming(ha, hb)
        if dist <= threshold:
            pairs.append((dist, fa, fb))

if not pairs:
    print("No duplicates found.")
else:
    print(f"\nFound {len(pairs)} duplicate pair(s) (threshold: {threshold}):\n")
    for dist, fa, fb in sorted(pairs):
        label = "exact" if dist == 0 else f"distance {dist}"
        print(f"  [{label}]")
        print(f"    {fa}")
        print(f"    {fb}")
        print()
PYEOF
