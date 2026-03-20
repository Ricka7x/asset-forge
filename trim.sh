#!/bin/bash
# Usage: ./trim.sh <file_or_dir> [output_dir] [fuzz]
# Auto-trims transparent or near-white borders from images.
# fuzz: color tolerance 0-100%, default 5 (higher = more aggressive trimming)
# If output_dir is omitted, files are trimmed in-place.
# Requires: ImageMagick

TARGET="${1:?'Usage: ./trim.sh <file_or_dir> [output_dir] [fuzz]'}"
OUT_DIR="${2:-}"
FUZZ="${3:-5}"

if command -v magick >/dev/null; then IM="magick"
elif command -v convert >/dev/null; then IM="convert"
else echo "Error: ImageMagick not found. Install with: brew install imagemagick"; exit 1; fi

trim_file() {
  local src="$1" dest="$2"
  $IM "$src" -fuzz "${FUZZ}%" -trim +repage "$dest"
  echo "  $dest"
}

if [ -f "$TARGET" ]; then
  dest="${OUT_DIR:-$TARGET}"
  [ -n "$OUT_DIR" ] && mkdir -p "$OUT_DIR" && dest="$OUT_DIR/${TARGET##*/}"
  trim_file "$TARGET" "$dest"
elif [ -d "$TARGET" ]; then
  [ -n "$OUT_DIR" ] && mkdir -p "$OUT_DIR"
  find "$TARGET" -type f \( -name '*.png' -o -name '*.jpg' -o -name '*.jpeg' -o -name '*.webp' \) | while read -r file; do
    if [ -n "$OUT_DIR" ]; then
      dest="$OUT_DIR/${file##*/}"
    else
      dest="$file"
    fi
    trim_file "$file" "$dest"
  done
else
  echo "Error: '$TARGET' is not a file or directory"; exit 1
fi

echo "Done."
