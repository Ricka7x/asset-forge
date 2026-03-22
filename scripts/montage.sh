#!/bin/bash
# Usage: ./montage.sh <images_dir> [output.png] [columns] [tile_size] [gap]
# Arranges images into a grid/collage.
# columns: number of columns, default auto (square-ish grid)
# tile_size: WxH per cell, default 400x400
# gap: pixels between images, default 10
# Requires: ImageMagick

SRC_DIR="${1:?'Usage: ./montage.sh <images_dir> [output.png] [columns] [tile_size] [gap]'}"
OUTPUT="${2:-montage.png}"
COLS="${3:-0}"        # 0 = auto
TILE_SIZE="${4:-400x400}"
GAP="${5:-10}"

if command -v magick >/dev/null; then IM="magick"
elif command -v convert >/dev/null; then IM="convert"
else echo "Error: ImageMagick not found. Install with: brew install imagemagick"; exit 1; fi

IFS=$'\n' read -r -d '' -a IMAGES < <(find "$SRC_DIR" -maxdepth 1 -type f \( -name '*.png' -o -name '*.jpg' -o -name '*.jpeg' -o -name '*.webp' \) | sort && printf '\0')

if [ ${#IMAGES[@]} -eq 0 ]; then
  echo "Error: no images found in $SRC_DIR"
  exit 1
fi

# Auto columns: closest to square root
if [ "$COLS" -eq 0 ]; then
  COLS=$(echo "scale=0; sqrt(${#IMAGES[@]})" | bc)
  [ "$COLS" -lt 1 ] && COLS=1
fi

echo "Building ${#IMAGES[@]}-image grid (${COLS} columns, ${TILE_SIZE} tiles)..."

$IM montage "${IMAGES[@]}" \
  -geometry "${TILE_SIZE}+${GAP}+${GAP}" \
  -tile "${COLS}x" \
  -background "#000000" \
  "$OUTPUT"

echo "Done → $OUTPUT"
