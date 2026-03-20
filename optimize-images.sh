#!/bin/bash
# Usage: ./optimize-images.sh <src_dir> <dest_dir> [quality]
# quality: 1-100, defaults to 95. Applies to all formats.
# Requires: pngquant, jpegoptim, svgo (optional)

SRC_DIR="${1:-${SRC_DIR:?'SRC_DIR required: pass as first arg or env var'}}"
DEST_DIR="${2:-${DEST_DIR:?'DEST_DIR required: pass as second arg or env var'}}"
QUALITY="${3:-${QUALITY:-95}}"

WEBP_QUALITY="$QUALITY"
AVIF_QUALITY="$QUALITY"

mkdir -p "$DEST_DIR"

# Mirror directory structure
find "$SRC_DIR" -type d | while read -r dir; do
  mkdir -p "$DEST_DIR${dir#$SRC_DIR}"
done

# Pick best output format for a raster image
# Preference: AVIF > WebP > original
best_convert() {
  local src="$1" dest_base="$2"
  if command -v avifenc >/dev/null; then
    avifenc -q "$AVIF_QUALITY" "$src" "${dest_base}.avif" && return
  fi
  if command -v cwebp >/dev/null; then
    cwebp -q "$WEBP_QUALITY" "$src" -o "${dest_base}.webp" && return
  fi
  # Fallback: copy original as-is
  cp "$src" "${dest_base}.${src##*.}"
}

# Process raster images (PNG, JPG, JPEG)
find "$SRC_DIR" -type f \( -name '*.png' -o -name '*.jpg' -o -name '*.jpeg' \) | while read -r file; do
  rel="${file#$SRC_DIR}"
  dest_base="$DEST_DIR${rel%.*}"
  best_convert "$file" "$dest_base"
done

# Optimize SVGs (keep as SVG)
find "$SRC_DIR" -type f -name '*.svg' | while read -r file; do
  rel="${file#$SRC_DIR}"
  out="$DEST_DIR$rel"
  if command -v svgo >/dev/null; then
    svgo -o "$out" "$file"
  else
    cp "$file" "$out"
  fi
done

echo "Image optimization complete!"
