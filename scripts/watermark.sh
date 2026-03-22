#!/bin/bash
# Usage: ./watermark.sh <src_file_or_dir> <dest_file_or_dir> [-l logo] [-t text] [-p position] [-o opacity]
# Adds a logo or text watermark to an image or all images in a directory.
# position: SouthEast (default), NorthEast, SouthWest, NorthWest, Center
# opacity: 0-100, default 70
# Requires: ImageMagick

source "$(dirname "$0")/_lib.sh"

SRC="${1:?'Usage: ./watermark.sh <src_file_or_dir> <dest_file_or_dir> [-l logo] [-t text] [-p position] [-o opacity]'}"
DEST="${2:?'Usage: ./watermark.sh <src_file_or_dir> <dest_file_or_dir> [-l logo] [-t text] [-p position] [-o opacity]'}"
shift 2

LOGO="" WM_TEXT="" POSITION="SouthEast" OPACITY=70
FONT="$(_resolve_font_regular)"

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

watermark_file() {
  local file="$1" out="$2"
  mkdir -p "$(dirname "$out")"
  if [ -n "$LOGO" ]; then
    read -r iw _ < <($IM identify -format "%w %h" "$file")
    logo_w=$(( iw * 15 / 100 ))
    $IM "$file" \
      \( "$LOGO" -resize "${logo_w}x" \
         -alpha set -channel alpha -evaluate multiply "$(echo "scale=2; $OPACITY/100" | bc)" +channel \
      \) \
      -gravity "$POSITION" -geometry "+20+20" -composite \
      "$out"
  else
    $IM "$file" \
      -font "$FONT" -pointsize 36 \
      -fill "rgba(255,255,255,$(echo "scale=2; $OPACITY/100" | bc))" \
      -gravity "$POSITION" -annotate "+20+20" "$WM_TEXT" \
      "$out"
  fi
  echo "  $out"
}

if [ -f "$SRC" ]; then
  if [ -d "$DEST" ] || [[ "$DEST" == */ ]]; then
    out="$DEST/${SRC##*/}"
  else
    out="$DEST"
  fi
  mkdir -p "$(dirname "$out")"
  watermark_file "$SRC" "$out"
  echo "Done → $out"
elif [ -d "$SRC" ]; then
  mkdir -p "$DEST"
  find "$SRC" -type f \( -name '*.png' -o -name '*.jpg' -o -name '*.jpeg' -o -name '*.webp' \) | while read -r file; do
    watermark_file "$file" "$DEST${file#$SRC}"
  done
  echo "Done → $DEST/"
else
  echo "Error: '$SRC' is not a file or directory"; exit 1
fi
