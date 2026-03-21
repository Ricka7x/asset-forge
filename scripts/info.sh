#!/bin/bash
# Usage: ./info.sh <image> [image2 ...]
# Prints dimensions, format, file size, color space, and key EXIF for each image.
# Requires: ImageMagick

if [ $# -eq 0 ]; then
  echo "Usage: ./info.sh <image> [image2 ...]"
  exit 1
fi

if command -v magick >/dev/null; then IM="magick"
elif command -v identify >/dev/null; then IM="identify"
else echo "Error: ImageMagick not found. Install with: brew install imagemagick"; exit 1; fi

for file in "$@"; do
  if [ ! -f "$file" ]; then
    echo "  ✗ Not found: $file"
    continue
  fi

  size_bytes=$(wc -c < "$file")
  if [ "$size_bytes" -ge 1048576 ]; then
    size_fmt="$(echo "scale=1; $size_bytes/1048576" | bc) MB"
  elif [ "$size_bytes" -ge 1024 ]; then
    size_fmt="$(echo "scale=1; $size_bytes/1024" | bc) KB"
  else
    size_fmt="${size_bytes} B"
  fi

  echo "── $file ──────────────────────────────────"
  $IM identify -verbose "$file" 2>/dev/null | awk '
    /^  Geometry:/      { print "  Dimensions:  " $2 }
    /^  Type:/          { print "  Type:        " $2 }
    /^  Format:/        { print "  Format:      " $2 }
    /^  Colorspace:/    { print "  Colorspace:  " $2 }
    /^  Depth:/         { print "  Bit depth:   " $2 }
    /^    exif:Make:/   { print "  Camera make: " $2 }
    /^    exif:Model:/  { print "  Camera model:" $2 }
    /^    exif:DateTime[^O]/ { print "  Date taken:  " $2 " " $3 }
    /^    exif:GPS/     { print "  " $0 }
  '
  echo "  File size:   $size_fmt"
  echo ""
done
