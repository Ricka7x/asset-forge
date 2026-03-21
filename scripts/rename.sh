#!/bin/bash
# Usage: ./rename.sh <dir> [options]
# Batch rename images in a directory.
# Options:
#   --prefix <str>     Add prefix to filenames
#   --suffix <str>     Add suffix before extension
#   --slugify          Lowercase, replace spaces/special chars with hyphens
#   --sequence [start] Zero-padded sequence numbers (replaces original name)
#   --dry-run          Preview changes without renaming
# Requires: bash 4+

DIR="${1:?'Usage: ./rename.sh <dir> [--prefix str] [--suffix str] [--slugify] [--sequence [n]] [--dry-run]'}"
PREFIX="" SUFFIX="" SLUGIFY=0 SEQUENCE=0 SEQ_START=1 DRY_RUN=0

shift
while [[ $# -gt 0 ]]; do
  case "$1" in
    --prefix)   PREFIX="$2";   shift 2 ;;
    --suffix)   SUFFIX="$2";   shift 2 ;;
    --slugify)  SLUGIFY=1;     shift ;;
    --sequence) SEQUENCE=1
                [[ "$2" =~ ^[0-9]+$ ]] && SEQ_START="$2" && shift
                shift ;;
    --dry-run)  DRY_RUN=1;    shift ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

[ ! -d "$DIR" ] && echo "Error: '$DIR' is not a directory" && exit 1

[ $DRY_RUN -eq 1 ] && echo "[dry-run — no files will be renamed]"

n=$SEQ_START
find "$DIR" -maxdepth 1 -type f \( -name '*.png' -o -name '*.jpg' -o -name '*.jpeg' -o -name '*.webp' -o -name '*.gif' \) | sort | while read -r file; do
  base="${file##*/}"
  ext="${base##*.}"
  name="${base%.*}"

  if [ $SEQUENCE -eq 1 ]; then
    name="$(printf '%04d' $n)"
    n=$(( n + 1 ))
  fi

  if [ $SLUGIFY -eq 1 ]; then
    name="$(echo "$name" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-\|-$//g')"
  fi

  new_name="${PREFIX}${name}${SUFFIX}.${ext}"
  new_path="${DIR}/${new_name}"

  if [ "$file" = "$new_path" ]; then
    continue
  fi

  echo "  $base → $new_name"
  [ $DRY_RUN -eq 0 ] && mv "$file" "$new_path"
done

[ $DRY_RUN -eq 0 ] && echo "Done." || echo "Done (dry-run)."
