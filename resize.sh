#!/bin/bash
# Usage: ./resize.sh <file_or_dir> <spec> [output_dir]
# Batch resize images. Output format preserved.
# spec examples:
#   800        — 800px wide, height auto
#   800x600    — fit within 800x600, preserve aspect ratio
#   800x600!   — force exact 800x600 (may distort)
#   800x600^   — fill 800x600, crop to fit
#   50%        — scale to 50%
# Requires: ImageMagick

TARGET="${1:?'Usage: ./resize.sh <file_or_dir> <spec> [output_dir]'}"
SPEC="${2:?'Spec required: e.g. 800, 800x600, 50%'}"
OUT_DIR="${3:-}"

if command -v magick >/dev/null; then IM="magick"
elif command -v convert >/dev/null; then IM="convert"
else echo "Error: ImageMagick not found. Install with: brew install imagemagick"; exit 1; fi

# Normalize: bare number means width only
[[ "$SPEC" =~ ^[0-9]+$ ]] && SPEC="${SPEC}x"

resize_file() {
  local src="$1" dest="$2"
  $IM "$src" -resize "$SPEC" "$dest"
  read -r w h < <($IM identify -format "%w %h" "$dest")
  echo "  $dest (${w}x${h})"
}

if [ -f "$TARGET" ]; then
  dest="${OUT_DIR:+$OUT_DIR/${TARGET##*/}}"
  dest="${dest:-$TARGET}"
  [ -n "$OUT_DIR" ] && mkdir -p "$OUT_DIR"
  resize_file "$TARGET" "$dest"
elif [ -d "$TARGET" ]; then
  [ -n "$OUT_DIR" ] && mkdir -p "$OUT_DIR"
  find "$TARGET" -type f \( -name '*.png' -o -name '*.jpg' -o -name '*.jpeg' -o -name '*.webp' \) | while read -r file; do
    rel="${file#$TARGET}"
    dest="${OUT_DIR:+$OUT_DIR$rel}"
    dest="${dest:-$file}"
    [ -n "$OUT_DIR" ] && mkdir -p "$(dirname "$dest")"
    resize_file "$file" "$dest"
  done
else
  echo "Error: '$TARGET' is not a file or directory"; exit 1
fi

echo "Done."
