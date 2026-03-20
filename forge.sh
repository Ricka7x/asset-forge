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
  audit)         exec "$SCRIPT_DIR/audit-images.sh" "$@" ;;
  promo)         exec "$SCRIPT_DIR/make-promo.sh" "$@" ;;
  ""|-h|--help)  usage ;;
  *)
    echo "Unknown command: $CMD"
    echo ""
    usage
    exit 1
    ;;
esac
