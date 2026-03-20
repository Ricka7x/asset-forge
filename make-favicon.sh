#!/bin/bash
# Usage: ./make-favicon.sh <input_logo> [output_dir]
# Generates a complete favicon set for web projects.
# Requires: ImageMagick

INPUT="${1:?'Usage: ./make-favicon.sh <logo.png> [output_dir]'}"
OUT_DIR="${2:-.}"

if command -v magick >/dev/null; then
  IM="magick"
elif command -v convert >/dev/null; then
  IM="convert"
else
  echo "Error: ImageMagick not found. Install with: brew install imagemagick"
  exit 1
fi

mkdir -p "$OUT_DIR"

echo "Generating favicon set..."

# favicon.ico — 16, 32, 48 embedded
$IM "$INPUT" \
  \( -clone 0 -resize 48x48 \) \
  \( -clone 0 -resize 32x32 \) \
  \( -clone 0 -resize 16x16 \) \
  -delete 0 \
  "$OUT_DIR/favicon.ico"
echo "  favicon.ico (16, 32, 48px embedded)"

# Standalone PNGs
for size in 16 32 48 180 192 512; do
  case $size in
    180) name="apple-touch-icon" ;;
    192) name="android-chrome-192x192" ;;
    512) name="android-chrome-512x512" ;;
    *)   name="favicon-${size}x${size}" ;;
  esac
  $IM "$INPUT" -resize "${size}x${size}" "$OUT_DIR/${name}.png"
  echo "  ${name}.png"
done

# site.webmanifest
cat > "$OUT_DIR/site.webmanifest" <<EOF
{
  "name": "",
  "short_name": "",
  "icons": [
    { "src": "/android-chrome-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/android-chrome-512x512.png", "sizes": "512x512", "type": "image/png" }
  ],
  "theme_color": "#ffffff",
  "background_color": "#ffffff",
  "display": "standalone"
}
EOF
echo "  site.webmanifest"

echo ""
echo "Add to your <head>:"
echo '  <link rel="icon" type="image/x-icon" href="/favicon.ico">'
echo '  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">'
echo '  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">'
echo '  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">'
echo '  <link rel="manifest" href="/site.webmanifest">'
echo ""
echo "Done → $OUT_DIR/"
