#!/bin/bash
# Usage: ./make-thumbnail.sh <src_file_or_dir> <dest_file_or_dir> [size] [gravity]
# Generates center-cropped thumbnails from a file or directory.
# size: WxH (default: 400x400)
# gravity: Center, North, South, NorthWest, etc. (default: Center)
# Requires: ImageMagick

SRC="${1:?'Usage: ./make-thumbnail.sh <src_file_or_dir> <dest_file_or_dir> [size] [gravity]'}"
DEST="${2:?'Usage: ./make-thumbnail.sh <src_file_or_dir> <dest_file_or_dir> [size] [gravity]'}"
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

thumbnail_file() {
  local src="$1" out="$2"
  mkdir -p "$(dirname "$out")"
  $IM "$src" -resize "${SIZE}^" -gravity "$GRAVITY" -extent "$SIZE" "$out"
  echo "  $out"
}

echo "Generating ${SIZE} thumbnails (gravity: ${GRAVITY})..."

if [ -f "$SRC" ]; then
  if [ -d "$DEST" ] || [[ "$DEST" == */ ]]; then
    out="$DEST/${SRC##*/}"
  else
    out="$DEST"
  fi
  thumbnail_file "$SRC" "$out"
  echo "Done → $out"
elif [ -d "$SRC" ]; then
  mkdir -p "$DEST"
  find "$SRC" -type f \( -name '*.png' -o -name '*.jpg' -o -name '*.jpeg' -o -name '*.webp' \) | while read -r file; do
    thumbnail_file "$file" "$DEST${file#$SRC}"
  done
  echo "Done → $DEST/"
else
  echo "Error: '$SRC' is not a file or directory"; exit 1
fi
