#!/bin/bash
# Usage: ./optimize-images.sh <src_file_or_dir> <dest_file_or_dir> [quality]
# quality: 1-100, defaults to 95. Applies to all formats.
# Requires: pngquant, jpegoptim, svgo (optional)

SRC="${1:-${SRC_DIR:?'Source required: pass as first arg or env var'}}"
DEST="${2:-${DEST_DIR:?'Destination required: pass as second arg or env var'}}"
QUALITY="${3:-${QUALITY:-95}}"

WEBP_QUALITY="$QUALITY"
AVIF_QUALITY="$QUALITY"

# Pick best output format for a raster image
# Preference: AVIF > WebP > original
best_convert() {
  local src="$1" dest_base="$2"
  mkdir -p "$(dirname "$dest_base")"
  if command -v avifenc >/dev/null; then
    avifenc -q "$AVIF_QUALITY" "$src" "${dest_base}.avif" && return
  fi
  if command -v cwebp >/dev/null; then
    cwebp -q "$WEBP_QUALITY" "$src" -o "${dest_base}.webp" && return
  fi
  cp "$src" "${dest_base}.${src##*.}"
}

if [ -f "$SRC" ]; then
  # Single file
  if [ -d "$DEST" ] || [[ "$DEST" == */ ]]; then
    dest_base="$DEST/${SRC##*/}"; dest_base="${dest_base%.*}"
  else
    dest_base="${DEST%.*}"
    mkdir -p "$(dirname "$dest_base")"
  fi
  best_convert "$SRC" "$dest_base"
elif [ -d "$SRC" ]; then
  mkdir -p "$DEST"
  # Mirror directory structure
  find "$SRC" -type d | while read -r dir; do
    mkdir -p "$DEST${dir#$SRC}"
  done
  # Process raster images (PNG, JPG, JPEG)
  find "$SRC" -type f \( -name '*.png' -o -name '*.jpg' -o -name '*.jpeg' \) | while read -r file; do
    rel="${file#$SRC}"
    best_convert "$file" "$DEST${rel%.*}"
  done
  # Optimize SVGs (keep as SVG)
  find "$SRC" -type f -name '*.svg' | while read -r file; do
    rel="${file#$SRC}"
    out="$DEST$rel"
    mkdir -p "$(dirname "$out")"
    if command -v svgo >/dev/null; then svgo -o "$out" "$file"
    else cp "$file" "$out"; fi
  done
else
  echo "Error: '$SRC' is not a file or directory"; exit 1
fi

echo "Image optimization complete!"
