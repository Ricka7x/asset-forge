#!/bin/bash
# Usage: ./audit-images.sh <file_or_dir> [size_threshold_kb]
# Audits an image or directory and reports image issues.
# Checks: oversized files, unoptimized formats, missing @2x retina variants.
# Requires: ImageMagick

TARGET="${1:?'Usage: ./audit-images.sh <file_or_dir> [size_threshold_kb]'}"
THRESHOLD_KB="${2:-200}"

if ! command -v magick >/dev/null && ! command -v identify >/dev/null; then
  echo "Error: ImageMagick not found. Install with: brew install imagemagick"
  exit 1
fi

ISSUES=0

# Build file list — single file or directory
if [ -f "$TARGET" ]; then
  FILES=("$TARGET")
  SEARCH_TARGET="$(dirname "$TARGET")"
elif [ -d "$TARGET" ]; then
  FILES=()
  SEARCH_TARGET="$TARGET"
else
  echo "Error: '$TARGET' is not a file or directory"; exit 1
fi

get_files() { # get_files <extensions_find_expr>
  if [ ${#FILES[@]} -gt 0 ]; then
    printf '%s\n' "${FILES[@]}"
  else
    eval "find \"$SEARCH_TARGET\" -type f $1"
  fi
}

echo "Auditing $TARGET (threshold: ${THRESHOLD_KB}KB)..."
echo ""

# 1. Oversized files
echo "── Large files (>${THRESHOLD_KB}KB) ──────────────────────────"
found=0
while IFS= read -r file; do
  size_kb=$(( $(wc -c < "$file") / 1024 ))
  if [ "$size_kb" -gt "$THRESHOLD_KB" ]; then
    echo "  [${size_kb}KB] $file"
    ISSUES=$(( ISSUES + 1 ))
    found=1
  fi
done < <(get_files "\( -name '*.png' -o -name '*.jpg' -o -name '*.jpeg' -o -name '*.gif' -o -name '*.webp' -o -name '*.avif' \)")
[ $found -eq 0 ] && echo "  none"
echo ""

# 2. Unoptimized formats (PNG/JPG that could be WebP/AVIF)
echo "── Unoptimized formats (PNG/JPG — consider WebP/AVIF) ────────"
found=0
while IFS= read -r file; do
  echo "  $file"
  ISSUES=$(( ISSUES + 1 ))
  found=1
done < <(get_files "\( -name '*.png' -o -name '*.jpg' -o -name '*.jpeg' \)")
[ $found -eq 0 ] && echo "  none"
echo ""

# 3. GIFs (should likely be video or WebP animated)
echo "── Animated GIFs (consider WebP/video) ──────────────────────"
found=0
while IFS= read -r file; do
  frames=$(identify "$file" 2>/dev/null | wc -l)
  if [ "$frames" -gt 1 ]; then
    echo "  [$frames frames] $file"
    ISSUES=$(( ISSUES + 1 ))
    found=1
  fi
done < <(get_files "-name '*.gif'")
[ $found -eq 0 ] && echo "  none"
echo ""

# 4. Missing @2x retina variants (skip for single-file mode)
if [ -d "$TARGET" ]; then
  echo "── Missing @2x retina variants ──────────────────────────────"
  found=0
  while IFS= read -r file; do
    base="${file%.*}"
    ext="${file##*.}"
    [[ "$base" == *@2x ]] && continue
    if [ ! -f "${base}@2x.${ext}" ]; then
      echo "  $file (no ${base##*/}@2x.${ext})"
      found=1
    fi
  done < <(find "$TARGET" -type f \( -name '*.png' -o -name '*.jpg' -o -name '*.jpeg' \))
  [ $found -eq 0 ] && echo "  none"
  echo ""
fi

# 5. Very small images (possibly placeholders left in)
echo "── Suspiciously small images (<10px) ────────────────────────"
found=0
while IFS= read -r file; do
  dims=$(identify -format "%wx%h" "$file" 2>/dev/null | head -1)
  w=$(echo "$dims" | cut -dx -f1)
  h=$(echo "$dims" | cut -dx -f2)
  if [ -n "$w" ] && [ "$w" -lt 10 ] || [ -n "$h" ] && [ "$h" -lt 10 ]; then
    echo "  [${dims}] $file"
    ISSUES=$(( ISSUES + 1 ))
    found=1
  fi
done < <(get_files "\( -name '*.png' -o -name '*.jpg' -o -name '*.jpeg' \)")
[ $found -eq 0 ] && echo "  none"
echo ""

echo "── Summary ──────────────────────────────────────────────────"
echo "  Total issues flagged: $ISSUES"
