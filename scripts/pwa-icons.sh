#!/bin/bash
# Usage: ./pwa-icons.sh <input_logo> [output_dir] [bg_color]
# Generates a complete PWA icon set including maskable variants.
# bg_color: background color for maskable icons, default "#ffffff"
# Requires: ImageMagick

INPUT="${1:?'Usage: ./pwa-icons.sh <logo.png> [output_dir] [bg_color]'}"
OUT_DIR="${2:-pwa-icons}"
BG_COLOR="${3:-#ffffff}"

if command -v magick >/dev/null; then IM="magick"
elif command -v convert >/dev/null; then IM="convert"
else echo "Error: ImageMagick not found. Install with: brew install imagemagick"; exit 1; fi

mkdir -p "$OUT_DIR"

echo "Generating PWA icon set..."

# Regular icon — logo fills full canvas
make_icon() {
  local px="$1" name="$2"
  $IM "$INPUT" -resize "${px}x${px}" "$OUT_DIR/${name}"
  echo "  $name (${px}x${px})"
}

# Maskable icon — logo fills 80% (10% safe zone each side), on solid background
make_maskable() {
  local px="$1" name="$2"
  local content=$(( px * 80 / 100 ))
  $IM \
    \( -size "${px}x${px}" "xc:${BG_COLOR}" \) \
    \( "$INPUT" -resize "${content}x${content}" -background none -gravity center -extent "${px}x${px}" \) \
    -composite \
    "$OUT_DIR/${name}"
  echo "  $name (${px}x${px}, maskable)"
}

# Regular icons
make_icon  72  "icon-72x72.png"
make_icon  96  "icon-96x96.png"
make_icon 128  "icon-128x128.png"
make_icon 144  "icon-144x144.png"
make_icon 152  "icon-152x152.png"
make_icon 192  "icon-192x192.png"
make_icon 384  "icon-384x384.png"
make_icon 512  "icon-512x512.png"

# Maskable icons (safe zone compliant)
make_maskable 192 "icon-192x192-maskable.png"
make_maskable 512 "icon-512x512-maskable.png"

# manifest.json
cat > "$OUT_DIR/manifest.json" <<EOF
{
  "icons": [
    { "src": "icon-72x72.png",           "sizes": "72x72",   "type": "image/png" },
    { "src": "icon-96x96.png",           "sizes": "96x96",   "type": "image/png" },
    { "src": "icon-128x128.png",         "sizes": "128x128", "type": "image/png" },
    { "src": "icon-144x144.png",         "sizes": "144x144", "type": "image/png" },
    { "src": "icon-152x152.png",         "sizes": "152x152", "type": "image/png" },
    { "src": "icon-192x192.png",         "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "icon-192x192-maskable.png","sizes": "192x192", "type": "image/png", "purpose": "maskable" },
    { "src": "icon-384x384.png",         "sizes": "384x384", "type": "image/png" },
    { "src": "icon-512x512.png",         "sizes": "512x512", "type": "image/png", "purpose": "any" },
    { "src": "icon-512x512-maskable.png","sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
EOF
echo "  manifest.json (merge icons array into your site manifest)"
echo ""
echo "Done → $OUT_DIR/"
