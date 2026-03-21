#!/bin/bash
# Usage: ./make-placeholder.sh <input> [output.png]
# Generates a tiny blurred LQIP (Low Quality Image Placeholder) for lazy loading.
# Prints the base64 data URI to stdout. Optionally saves the PNG.
# Requires: ImageMagick

INPUT="${1:?'Usage: ./make-placeholder.sh <image> [output.png]'}"
OUTPUT_PNG="${2:-}"

if command -v magick >/dev/null; then
  IM="magick"
elif command -v convert >/dev/null; then
  IM="convert"
else
  echo "Error: ImageMagick not found. Install with: brew install imagemagick"
  exit 1
fi

TMP=$(mktemp /tmp/placeholder-XXXXXX.png)
trap 'rm -f "$TMP"' EXIT

$IM "$INPUT" \
  -resize "20x20" \
  -blur "0x4" \
  -strip \
  "$TMP"

# If an output path was given, also save the PNG
if [ -n "$OUTPUT_PNG" ]; then
  cp "$TMP" "$OUTPUT_PNG"
  echo "Saved → $OUTPUT_PNG" >&2
fi

# Always print the data URI to stdout
MIME="image/png"
B64=$(base64 < "$TMP")
echo "data:${MIME};base64,${B64}"
