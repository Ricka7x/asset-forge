#!/bin/bash
# Usage: ./make-thumbnail.sh <src_dir> <dest_dir> [size] [gravity]
# Batch generates center-cropped thumbnails.
# size: WxH (default: 400x400)
# gravity: Center, North, South, NorthWest, etc. (default: Center)
# Requires: ImageMagick

SRC_DIR="${1:?'Usage: ./make-thumbnail.sh <src_dir> <dest_dir> [size] [gravity]'}"
DEST_DIR="${2:?'Usage: ./make-thumbnail.sh <src_dir> <dest_dir> [size] [gravity]'}"
SIZE="${3:-400x400}"
GRAVITY="${4:-Center}"

if command -v magick >/dev/null; then
  IM="magick"
elif command -v convert >/dev/null; then
  IM="convert"
else
  echo "Error: ImageMagick not found. Install with: brew install imagemagick"
  exit 1
fi

mkdir -p "$DEST_DIR"

echo "Generating ${SIZE} thumbnails (gravity: ${GRAVITY})..."

find "$SRC_DIR" -type f \( -name '*.png' -o -name '*.jpg' -o -name '*.jpeg' -o -name '*.webp' \) | while read -r file; do
  rel="${file#$SRC_DIR}"
  out="$DEST_DIR$rel"
  mkdir -p "$(dirname "$out")"

  $IM "$file" \
    -resize "${SIZE}^" \
    -gravity "$GRAVITY" \
    -extent "$SIZE" \
    "$out"

  echo "  $out"
done

echo "Done → $DEST_DIR/"
