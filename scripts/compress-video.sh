#!/bin/bash
# Usage: ./compress-video.sh <input> [output] [target_size_mb|quality]
# Aggressively compresses a video for sharing (email, WhatsApp, web upload).
# target_size_mb: target file size in MB (e.g. 8 for WhatsApp, 25 for email)
#                 If not set, uses quality mode (crf 28, 720p max).
# Requires: ffmpeg (brew install ffmpeg)

INPUT="${1:?'Usage: ./compress-video.sh <input> [output] [target_size_mb]'}"
EXT="${INPUT##*.}"
BASE="$(basename "${INPUT%.*}")"
OUTPUT="${2:-${BASE}-compressed.${EXT}}"
TARGET_MB="${3:-}"

if ! command -v ffmpeg >/dev/null; then
  echo "Error: ffmpeg not found. Install with: brew install ffmpeg"
  exit 1
fi

echo "Compressing $(basename "$INPUT")..."

if [ -n "$TARGET_MB" ]; then
  # Two-pass bitrate targeting
  DURATION=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$INPUT" 2>/dev/null)
  TARGET_BITS=$(echo "$TARGET_MB * 8 * 1024 * 1024" | bc)
  AUDIO_BITS=128000
  VIDEO_BITS=$(echo "($TARGET_BITS / $DURATION) - $AUDIO_BITS" | bc)

  echo "  Target: ${TARGET_MB}MB → video bitrate ~$(( VIDEO_BITS / 1000 ))kbps"

  ffmpeg -i "$INPUT" -c:v libx264 -b:v "${VIDEO_BITS}" \
    -pass 1 -an -f mp4 /dev/null -y -loglevel error
  ffmpeg -i "$INPUT" -c:v libx264 -b:v "${VIDEO_BITS}" \
    -pass 2 -c:a aac -b:a 128k \
    -movflags faststart -pix_fmt yuv420p \
    -y "$OUTPUT" -loglevel error
  rm -f ffmpeg2pass-0.log ffmpeg2pass-0.log.mbtree
else
  # Quality mode: CRF 28, scale down to 720p max
  ffmpeg -i "$INPUT" \
    -c:v libx264 -crf 28 -preset slow \
    -vf "scale='min(1280,iw)':'min(720,ih)':force_original_aspect_ratio=decrease" \
    -c:a aac -b:a 96k \
    -movflags faststart -pix_fmt yuv420p \
    -y "$OUTPUT" -loglevel error
fi

IN_SIZE=$(wc -c < "$INPUT")
OUT_SIZE=$(wc -c < "$OUTPUT")
REDUCTION=$(( (IN_SIZE - OUT_SIZE) * 100 / IN_SIZE ))
echo "Done → $OUTPUT ($(( OUT_SIZE / 1024 / 1024 ))MB, ${REDUCTION}% smaller)"
