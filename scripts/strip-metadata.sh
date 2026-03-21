#!/bin/bash
# Usage: ./strip-metadata.sh <file_or_dir>
# Strips all EXIF/metadata from images in-place.
# Requires: ImageMagick (or exiftool if available — faster for bulk)

TARGET="${1:?'Usage: ./strip-metadata.sh <file_or_dir>'}"

if command -v magick >/dev/null; then
  IM="magick"
elif command -v convert >/dev/null; then
  IM="convert"
else
  echo "Error: ImageMagick not found. Install with: brew install imagemagick"
  exit 1
fi

strip_file() {
  local file="$1"
  if command -v exiftool >/dev/null; then
    exiftool -all= -overwrite_original "$file" -q
  else
    $IM "$file" -strip "$file"
  fi
  echo "  stripped: $file"
}

if [ -f "$TARGET" ]; then
  strip_file "$TARGET"
elif [ -d "$TARGET" ]; then
  find "$TARGET" -type f \( -name '*.jpg' -o -name '*.jpeg' -o -name '*.png' -o -name '*.webp' \) | while read -r file; do
    strip_file "$file"
  done
else
  echo "Error: '$TARGET' is not a file or directory"
  exit 1
fi

echo "Done."
