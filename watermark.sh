#!/bin/bash
# Usage: ./watermark.sh <src_dir> <dest_dir> [-l logo] [-t text] [-p position] [-o opacity]
# Bulk-adds a logo or text watermark to all images in a directory.
# position: SouthEast (default), NorthEast, SouthWest, NorthWest, Center
# opacity: 0-100, default 70
# Requires: ImageMagick

SRC_DIR="${1:?'Usage: ./watermark.sh <src_dir> <dest_dir> [-l logo] [-t text] [-p position] [-o opacity]'}"
DEST_DIR="${2:?'Usage: ./watermark.sh <src_dir> <dest_dir> [-l logo] [-t text] [-p position] [-o opacity]'}"
shift 2

LOGO="" WM_TEXT="" POSITION="SouthEast" OPACITY=70

while getopts "l:t:p:o:h" opt; do
  case $opt in
    l) LOGO="$OPTARG" ;;
    t) WM_TEXT="$OPTARG" ;;
    p) POSITION="$OPTARG" ;;
    o) OPACITY="$OPTARG" ;;
    h) echo "Usage: ./watermark.sh <src_dir> <dest_dir> [-l logo] [-t text] [-p position] [-o opacity]"; exit 0 ;;
    *) exit 1 ;;
  esac
done

[ -z "$LOGO" ] && [ -z "$WM_TEXT" ] && echo "Error: provide -l <logo> or -t <text>" && exit 1

if command -v magick >/dev/null; then IM="magick"
elif command -v convert >/dev/null; then IM="convert"
else echo "Error: ImageMagick not found. Install with: brew install imagemagick"; exit 1; fi

mkdir -p "$DEST_DIR"

ALPHA=$(echo "$OPACITY * 65535 / 100" | bc)

find "$SRC_DIR" -type f \( -name '*.png' -o -name '*.jpg' -o -name '*.jpeg' -o -name '*.webp' \) | while read -r file; do
  rel="${file#$SRC_DIR}"
  out="$DEST_DIR$rel"
  mkdir -p "$(dirname "$out")"

  if [ -n "$LOGO" ]; then
    # Logo watermark: resize to ~15% of image width, apply opacity
    read -r iw _ < <($IM identify -format "%w %h" "$file")
    logo_w=$(( iw * 15 / 100 ))
    $IM "$file" \
      \( "$LOGO" -resize "${logo_w}x" \
         -alpha set -channel alpha -evaluate multiply "$(echo "scale=2; $OPACITY/100" | bc)" +channel \
      \) \
      -gravity "$POSITION" -geometry "+20+20" -composite \
      "$out"
  else
    # Text watermark
    $IM "$file" \
      -font Helvetica -pointsize 36 \
      -fill "rgba(255,255,255,$(echo "scale=2; $OPACITY/100" | bc))" \
      -gravity "$POSITION" -annotate "+20+20" "$WM_TEXT" \
      "$out"
  fi

  echo "  $out"
done

echo "Done → $DEST_DIR/"
