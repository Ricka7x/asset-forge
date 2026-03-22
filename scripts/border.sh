#!/bin/bash
# Usage: ./border.sh <file_or_dir> [output_dir] [size] [color]
# Adds a solid border/stroke around images.
# size:  border thickness in px, default 4
# color: border color in hex or name, default "#000000"
# Requires: ImageMagick

TARGET="${1:?'Usage: ./border.sh <file_or_dir> [output_dir] [size] [color]'}"
OUT_DIR="${2:-}"
SIZE="${3:-4}"
COLOR="${4:-#000000}"

if command -v magick >/dev/null; then IM="magick"
elif command -v convert >/dev/null; then IM="convert"
else echo "Error: ImageMagick not found. Install with: brew install imagemagick"; exit 1; fi

add_border() {
  local src="$1" dest="$2"
  $IM "$src" -bordercolor "$COLOR" -border "${SIZE}x${SIZE}" "$dest"
  echo "  $dest"
}

if [ -f "$TARGET" ]; then
  if [ -z "$OUT_DIR" ]; then
    dest="$TARGET"
  elif [ -d "$OUT_DIR" ] || [[ "$OUT_DIR" == */ ]]; then
    mkdir -p "$OUT_DIR"
    dest="$OUT_DIR/${TARGET##*/}"
  else
    mkdir -p "$(dirname "$OUT_DIR")"
    dest="$OUT_DIR"
  fi
  add_border "$TARGET" "$dest"
elif [ -d "$TARGET" ]; then
  [ -n "$OUT_DIR" ] && mkdir -p "$OUT_DIR"
  find "$TARGET" -type f \( -name '*.png' -o -name '*.jpg' -o -name '*.jpeg' \) | while read -r file; do
    dest="${OUT_DIR:+$OUT_DIR/${file##*/}}"
    dest="${dest:-$file}"
    add_border "$file" "$dest"
  done
else
  echo "Error: '$TARGET' is not a file or directory"; exit 1
fi

echo "Done."
