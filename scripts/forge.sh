#!/bin/bash
# forge — unified image tooling entrypoint
# Usage: forge <command> [args...]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

usage() {
  cat <<EOF
forge — image asset toolkit

Usage:
  forge <command> [args...]

Commands:
  optimize        Compress images (best format per file)
                  forge optimize <src_dir> <dest_dir> [quality]

  favicon         Generate full web favicon set + site.webmanifest
                  forge favicon <logo> [output_dir]

  og-image        Resize/crop to Open Graph spec (1200x630)
                  forge og-image <image> [output.png] [gravity]

  appiconset      macOS AppIcon.appiconset for Xcode (with squircle + padding)
                  forge appiconset <logo> [output_dir]

  ios-icons       iOS AppIcon.appiconset for Xcode
                  forge ios-icons <logo> [output_dir]

  android-icons   Android mipmap icon folders
                  forge android-icons <logo> [output_dir]

  sprites         Horizontal sprite sheet + CSS
                  forge sprites <images_dir> [output_name] [css_prefix]

  placeholder     Tiny blurred LQIP — prints base64 data URI to stdout
                  forge placeholder <image> [output.png]

  strip-meta      Strip EXIF/metadata in-place
                  forge strip-meta <file_or_dir>

  thumbnail       Batch center-crop thumbnails
                  forge thumbnail <src_dir> <dest_dir> [size] [gravity]

  audit           Audit directory for image issues
                  forge audit <dir> [size_threshold_kb]

  promo           Generate marketing images (App Store, social, OG, etc.)
                  forge promo -b <bg> -l <logo> -t <headline> [-s <subtitle>] [-o <dir>]

  srcset          Generate @1x @2x @3x variants for HTML srcset
                  forge srcset <image> [output_dir] [scales]

  gif-to-video    Convert animated GIF to MP4 + WebM
                  forge gif-to-video <input.gif> [output_dir]

  video-to-gif    Convert a video clip to an optimized GIF
                  forge video-to-gif <input.mp4> [output.gif] [fps] [width]

  convert-video   Convert between video formats (MP4, WebM, MOV, etc.)
                  forge convert-video <input> <output.ext> [quality]

  blur-hash       Generate a BlurHash string for image placeholders
                  forge blur-hash <image>

  device-frame    Wrap a screenshot in a device mockup frame
                  forge device-frame <screenshot> [output.png] [iphone|android|browser]

  feature-graphic Google Play Store feature graphic (1024x500)
                  forge feature-graphic -b <bg> -t <headline> [-l logo] [-s subtitle]

  watermark       Bulk-add logo or text watermark to images
                  forge watermark <src_dir> <dest_dir> [-l logo] [-t text] [-p position]

  github-social   GitHub repository social preview (1280x640)
                  forge github-social -b <bg> -t <headline> [-l logo] [-s subtitle]

  email-banner    Email header banner (600x200)
                  forge email-banner -b <bg> [-l logo] [-t headline] [-s subtitle]

  montage         Arrange images into a grid/collage
                  forge montage <images_dir> [output.png] [columns] [tile_size] [gap]

  info            Print image metadata (dimensions, format, EXIF)
                  forge info <image> [image2 ...]

  compare         Side-by-side visual diff of two images
                  forge compare <image_a> <image_b> [output.png] [horizontal|vertical]

  palette         Extract dominant colors as hex codes
                  forge palette <image> [num_colors] [swatch.png]

  trim            Auto-trim transparent/white borders from images
                  forge trim <file_or_dir> [output_dir] [fuzz%]

  shadow          Add a drop shadow to a PNG
                  forge shadow <input> [output.png] [blur] [opacity] [offset_x] [offset_y]

  round-corners   Apply rounded corners to any image
                  forge round-corners <input> [output.png] [radius]

  border          Add a solid border/stroke around images
                  forge border <file_or_dir> [output_dir] [size] [color]

  add-text        Add a text overlay to an image
                  forge add-text <input> <text> [output.png] [gravity] [size] [color]

  trim-video      Cut a video to a start/end time range
                  forge trim-video <input> <start> <end> [output]

  extract-frames  Extract frames from a video as PNG images
                  forge extract-frames <video> [output_dir] [fps|all]

  compress-video  Aggressively compress a video for sharing
                  forge compress-video <input> [output] [target_mb]

  pwa-icons       Generate PWA icon set with maskable variants
                  forge pwa-icons <logo> [output_dir] [bg_color]

  resize          Batch resize images (width, WxH, percentage, etc.)
                  forge resize <file_or_dir> <spec> [output_dir]

  rename          Batch rename images (prefix, suffix, slugify, sequence)
                  forge rename <dir> [--prefix str] [--suffix str] [--slugify] [--sequence] [--dry-run]

  duplicates      Find visually similar/duplicate images
                  forge duplicates <dir> [threshold]

  convert         Convert a single image to a different format
                  forge convert <input> <output.ext> [quality]
EOF
}

CMD="${1}"
shift 2>/dev/null

case "$CMD" in
  optimize)      exec "$SCRIPT_DIR/optimize-images.sh" "$@" ;;
  favicon)       exec "$SCRIPT_DIR/make-favicon.sh" "$@" ;;
  og-image)      exec "$SCRIPT_DIR/make-og-image.sh" "$@" ;;
  appiconset)    exec "$SCRIPT_DIR/make-appiconset.sh" "$@" ;;
  ios-icons)     exec "$SCRIPT_DIR/make-appiconset-ios.sh" "$@" ;;
  android-icons) exec "$SCRIPT_DIR/make-appiconset-android.sh" "$@" ;;
  sprites)       exec "$SCRIPT_DIR/make-sprites.sh" "$@" ;;
  placeholder)   exec "$SCRIPT_DIR/make-placeholder.sh" "$@" ;;
  strip-meta)    exec "$SCRIPT_DIR/strip-metadata.sh" "$@" ;;
  thumbnail)     exec "$SCRIPT_DIR/make-thumbnail.sh" "$@" ;;
  audit)           exec "$SCRIPT_DIR/audit-images.sh" "$@" ;;
  promo)           exec "$SCRIPT_DIR/make-promo.sh" "$@" ;;
  srcset)          exec "$SCRIPT_DIR/srcset.sh" "$@" ;;
  gif-to-video)    exec "$SCRIPT_DIR/gif-to-video.sh" "$@" ;;
  video-to-gif)    exec "$SCRIPT_DIR/video-to-gif.sh" "$@" ;;
  convert-video)   exec "$SCRIPT_DIR/convert-video.sh" "$@" ;;
  blur-hash)       exec "$SCRIPT_DIR/blur-hash.sh" "$@" ;;
  device-frame)    exec "$SCRIPT_DIR/device-frame.sh" "$@" ;;
  feature-graphic) exec "$SCRIPT_DIR/make-feature-graphic.sh" "$@" ;;
  watermark)       exec "$SCRIPT_DIR/watermark.sh" "$@" ;;
  github-social)   exec "$SCRIPT_DIR/make-github-social.sh" "$@" ;;
  email-banner)    exec "$SCRIPT_DIR/make-email-banner.sh" "$@" ;;
  montage)         exec "$SCRIPT_DIR/montage.sh" "$@" ;;
  info)            exec "$SCRIPT_DIR/info.sh" "$@" ;;
  compare)         exec "$SCRIPT_DIR/compare.sh" "$@" ;;
  palette)         exec "$SCRIPT_DIR/palette.sh" "$@" ;;
  trim)            exec "$SCRIPT_DIR/trim.sh" "$@" ;;
  shadow)          exec "$SCRIPT_DIR/shadow.sh" "$@" ;;
  round-corners)   exec "$SCRIPT_DIR/round-corners.sh" "$@" ;;
  border)          exec "$SCRIPT_DIR/border.sh" "$@" ;;
  add-text)        exec "$SCRIPT_DIR/add-text.sh" "$@" ;;
  trim-video)      exec "$SCRIPT_DIR/trim-video.sh" "$@" ;;
  extract-frames)  exec "$SCRIPT_DIR/extract-frames.sh" "$@" ;;
  compress-video)  exec "$SCRIPT_DIR/compress-video.sh" "$@" ;;
  pwa-icons)       exec "$SCRIPT_DIR/pwa-icons.sh" "$@" ;;
  resize)          exec "$SCRIPT_DIR/resize.sh" "$@" ;;
  rename)          exec "$SCRIPT_DIR/rename.sh" "$@" ;;
  duplicates)      exec "$SCRIPT_DIR/duplicates.sh" "$@" ;;
  convert)         exec "$SCRIPT_DIR/convert.sh" "$@" ;;
  ""|-h|--help)  usage ;;
  *)
    echo "Unknown command: $CMD"
    echo ""
    usage
    exit 1
    ;;
esac
