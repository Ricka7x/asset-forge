#!/bin/bash
# Usage: ./blur-hash.sh <image>
# Generates a BlurHash string for use as an image placeholder.
# Requires: Python 3 + Pillow + blurhash  (pip install Pillow blurhash)

INPUT="${1:?'Usage: ./blur-hash.sh <image>'}"
X_COMPONENTS="${X_COMPONENTS:-4}"
Y_COMPONENTS="${Y_COMPONENTS:-3}"

if ! command -v python3 >/dev/null; then
  echo "Error: python3 not found."
  exit 1
fi

python3 - "$INPUT" "$X_COMPONENTS" "$Y_COMPONENTS" <<'PYEOF'
import sys

try:
    from PIL import Image
    import blurhash
except ImportError:
    print("Error: missing dependencies. Install with:", file=sys.stderr)
    print("  pip install Pillow blurhash", file=sys.stderr)
    sys.exit(1)

path, xc, yc = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])

img = Image.open(path).convert("RGB")
img.thumbnail((128, 128))  # downsample for speed
w, h = img.size
pixels = list(img.getdata())

result = blurhash.encode(pixels, w, h, x_components=xc, y_components=yc)
print(result)
PYEOF
