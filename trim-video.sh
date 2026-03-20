#!/bin/bash
# Usage: ./trim-video.sh <input> <start> <end> [output]
# Cuts a video to a specific time range.
# start/end: HH:MM:SS, MM:SS, or seconds (e.g. 0:30, 1:22:05, 90)
# Output format is inferred from input extension if not specified.
# Requires: ffmpeg (brew install ffmpeg)

INPUT="${1:?'Usage: ./trim-video.sh <input> <start> <end> [output]'}"
START="${2:?'Start time required (e.g. 0:30 or 90)'}"
END="${3:?'End time required (e.g. 1:45 or 105)'}"
EXT="${INPUT##*.}"
BASE="${INPUT%.*}"
OUTPUT="${4:-${BASE}-trimmed.${EXT}}"

if ! command -v ffmpeg >/dev/null; then
  echo "Error: ffmpeg not found. Install with: brew install ffmpeg"
  exit 1
fi

ffmpeg -i "$INPUT" \
  -ss "$START" \
  -to "$END" \
  -c copy \
  -avoid_negative_ts make_zero \
  -y "$OUTPUT" -loglevel error

echo "Done → $OUTPUT"
