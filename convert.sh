#!/bin/bash
# Usage: ./convert.sh <input> <output.ext> [quality]
# Converts a single image to a different format.
# Output format is inferred from the extension.
# quality: 1-100, default 95
# Requires: ImageMagick (+ avifenc/cwebp for AVIF/WebP if available)

INPUT="${1:?'Usage: ./convert.sh <input> <output.ext> [quality]'}"
OUTPUT="${2:?'Output file required (e.g. logo.webp, photo.avif, image.png)'}"
QUALITY="${3:-95}"

if command -v magick >/dev/null; then IM="magick"
elif command -v convert >/dev/null; then IM="convert"
else echo "Error: ImageMagick not found. Install with: brew install imagemagick"; exit 1; fi

EXT="${OUTPUT##*.}"
EXT="${EXT,,}"

case "$EXT" in
  avif)
    if command -v avifenc >/dev/null; then
      avifenc -q "$QUALITY" "$INPUT" "$OUTPUT"
    else
      echo "Warning: avifenc not found, falling back to ImageMagick (lower quality AVIF)"
      $IM "$INPUT" -quality "$QUALITY" "$OUTPUT"
    fi
    ;;
  webp)
    if command -v cwebp >/dev/null; then
      cwebp -q "$QUALITY" "$INPUT" -o "$OUTPUT"
    else
      $IM "$INPUT" -quality "$QUALITY" "$OUTPUT"
    fi
    ;;
  *)
    $IM "$INPUT" -quality "$QUALITY" "$OUTPUT"
    ;;
esac

IN_SIZE=$(wc -c < "$INPUT")
OUT_SIZE=$(wc -c < "$OUTPUT")
DIFF=$(( (IN_SIZE - OUT_SIZE) * 100 / IN_SIZE ))
if [ "$DIFF" -gt 0 ]; then
  echo "Done → $OUTPUT (${DIFF}% smaller)"
else
  echo "Done → $OUTPUT ($(( -DIFF ))% larger)"
fi
