# asset-forge

The complete asset toolkit for developers. Generate app icons, favicons, OG images, video conversions, and more — from the command line.

## Installation

### Homebrew (recommended)

```bash
brew tap YOUR_USERNAME/asset-forge
brew install asset-forge
```

### Build from source

Requires [Bun](https://bun.sh) and [ImageMagick](https://imagemagick.org).

```bash
git clone https://github.com/YOUR_USERNAME/asset-forge
cd asset-forge
bun install
bun run build
ln -sf $(pwd)/dist/asset-forge /usr/local/bin/asset-forge
```

## Dependencies

```bash
brew install imagemagick   # required by all image commands
brew install ffmpeg        # required by all video commands
brew install svgo          # optional — SVG optimization
brew install exiftool      # optional — faster metadata stripping
```

## Usage

```bash
asset-forge [command] [options]
```

Run without arguments to see the banner and version info.

## Configuration

Settings are stored in `~/.config/asset-forge/config.json`.

```bash
forge config set outDir ~/Desktop/assets   # default output directory
forge config set fontBold /path/to/font.ttf    # bold font for text commands
forge config set fontRegular /path/to/font.ttf # regular font for text commands
forge config get                               # show all current settings
forge config reset                             # restore defaults
```

### Output directory

By default all output files go to the current working directory. Set a persistent default:

```bash
forge config set outDir ~/Desktop/assets
```

Override for a single run with the `FORGE_OUT` env var:

```bash
FORGE_OUT=/tmp/preview forge og-image -b photo.jpg -o og.png
```

### Fonts

Text commands (`og-image`, `promo`, `add-text`, etc.) auto-detect a usable font via:

1. `FORGE_FONT_BOLD` / `FORGE_FONT_REGULAR` env vars (per-run)
2. `forge config set fontBold` / `forge config set fontRegular` (persistent)
3. `fc-match` — asks the OS for the best available sans-serif font
4. Known system font paths (macOS + common Linux distros)

To use a specific font persistently:

```bash
forge config set fontBold /System/Library/Fonts/Supplemental/Arial\ Bold.ttf
forge config set fontRegular /System/Library/Fonts/Supplemental/Arial.ttf
```

Or for a single run:

```bash
FORGE_FONT_BOLD=/path/to/MyFont-Bold.ttf forge promo -b bg.jpg -l logo.png -t "Hello"
```

## Publishing to Homebrew

### 1. Push the code to GitHub

Create a repo named `asset-forge` on GitHub and push:

```bash
git remote add origin https://github.com/YOUR_USERNAME/asset-forge.git
git push -u origin main
```

### 2. Create a Homebrew tap repo

Create a **second** GitHub repo named exactly `homebrew-asset-forge` (the `homebrew-` prefix is required by Homebrew). Leave it empty for now.

### 3. Tag a release — this triggers the build

```bash
git tag v0.1.0
git push origin v0.1.0
```

The GitHub Actions workflow (`.github/workflows/release.yml`) will:

- Build binaries for macOS arm64, macOS x64, and Linux x64
- Create a GitHub Release with the binaries and their `.sha256` files

### 4. Copy the SHA256 hashes

Once the release is created, open it on GitHub and download (or view) the `.sha256` files. You'll need three values:

- `asset-forge-darwin-arm64.sha256`
- `asset-forge-darwin-x64.sha256`
- `asset-forge-linux-x64.sha256`

Or grab them from the terminal:

```bash
curl -sL https://github.com/YOUR_USERNAME/asset-forge/releases/download/v0.1.0/asset-forge-darwin-arm64.sha256
```

### 5. Update the formula

Edit `Formula/asset-forge.rb` and replace:

- `YOUR_USERNAME` → your actual GitHub username
- All three `PLACEHOLDER_*_SHA256` values with the real hashes from the release

### 6. Push the formula to the tap repo

```bash
cp Formula/asset-forge.rb ../homebrew-asset-forge/
cd ../homebrew-asset-forge
git init
git add asset-forge.rb
git commit -m "Add asset-forge formula v0.1.0"
git remote add origin https://github.com/YOUR_USERNAME/homebrew-asset-forge.git
git push -u origin main
```

### 7. Test the tap

```bash
brew tap YOUR_USERNAME/asset-forge
brew install asset-forge
asset-forge --help
```

### 8. Updating for future releases

For every new version:

1. Bump `version` in `package.json` and `src/banner.ts`
2. Push a new tag: `git tag v0.2.0 && git push origin v0.2.0`
3. Wait for the GitHub Actions release to finish
4. Update `version` and the three `sha256` values in `Formula/asset-forge.rb`
5. Push the updated formula to `homebrew-asset-forge`

---

## Development

```bash
bun run dev        # run from source
bun run build      # compile to dist/asset-forge
bun run build:all  # cross-compile for macOS arm64/x64 and Linux x64
```

---

## Commands

### `optimize` — Compress images

Compresses raster images to the best available modern format (AVIF → WebP → original). One output per input file.

```bash
asset-forge optimize <src_dir> <dest_dir> [quality]
```

| Arg | Default | Description |
|-----|---------|-------------|
| `quality` | `95` | 1–100, applies to all formats. Also settable via `QUALITY=` env var |

```bash
asset-forge optimize ./images ./public/img
asset-forge optimize ./images ./public/img 80
QUALITY=75 asset-forge optimize ./images ./dist/img
```

---

### `favicon` — Web favicon set

Generates a complete favicon set and `site.webmanifest` for web projects.

```bash
asset-forge favicon <logo> [output_dir]
```

Outputs: `favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png`, `android-chrome-192x192.png`, `android-chrome-512x512.png`, `site.webmanifest`

```bash
asset-forge favicon logo.png ./public
```

Add to your `<head>`:
```html
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
```

---

### `og-image` — Open Graph image

Resizes and center-crops any image to the Open Graph spec (1200×630). Text and logo are optional.

```bash
asset-forge og-image -b <image> [-t headline] [-s subtitle] [-l logo] [-o output.png] [-g gravity] [-c overlay] [-f text_color]
```

| Flag | Default | Description |
|------|---------|-------------|
| `-b` | required | Background image |
| `-t` | — | Headline text |
| `-s` | — | Subtitle text |
| `-l` | — | Logo (shown on the left) |
| `-o` | `og-image.png` | Output file |
| `-g` | `Center` | Crop gravity: `Center`, `North`, `South`, etc. |
| `-c` | `rgba(0,0,0,0.45)` | Overlay color (only applied when text/logo present) |
| `-f` | `white` | Text color |

```bash
# Plain crop
asset-forge og-image -b hero.jpg

# With text
asset-forge og-image -b hero.jpg -t "App Name" -s "Your tagline"

# With logo + text
asset-forge og-image -b hero.jpg -l logo.png -t "App Name" -s "Tagline" -o og.png
```

---

### `appiconset` — macOS Xcode app icons

Generates `AppIcon.appiconset` for macOS Xcode projects. Applies the macOS squircle shape with 10% padding on each side.

```bash
asset-forge appiconset <logo> [output_dir]
```

Outputs all required sizes (16px–1024px) + `Contents.json`. Drop the folder directly into your `.xcassets`.

```bash
asset-forge appiconset logo.png
asset-forge appiconset logo.png MyApp.appiconset
```

---

### `ios-icons` — iOS Xcode app icons

Generates `AppIcon.appiconset` for iOS Xcode projects. No squircle applied — iOS clips automatically.

```bash
asset-forge ios-icons <logo> [output_dir]
```

Covers all iOS/iPadOS sizes (20px–1024px) + `Contents.json`.

```bash
asset-forge ios-icons logo.png
```

---

### `android-icons` — Android mipmap icons

Generates the full `res/mipmap-*` folder structure for Android projects, including round variants and a Play Store icon.

```bash
asset-forge android-icons <logo> [output_dir]
```

Outputs `ic_launcher.png` + `ic_launcher_round.png` at all densities (mdpi → xxxhdpi) and a `ic_launcher-playstore.png` (512×512).

```bash
asset-forge android-icons logo.png
asset-forge android-icons logo.png app/src/main/res
```

---

### `sprites` — Sprite sheet

Combines all images in a directory into a single horizontal sprite sheet with accompanying CSS.

```bash
asset-forge sprites <images_dir> [output_name] [css_prefix]
```

| Arg | Default | Description |
|-----|---------|-------------|
| `output_name` | `sprite` | Base name for `.png` and `.css` output files |
| `css_prefix` | `.sprite` | CSS class prefix for generated selectors |

```bash
asset-forge sprites ./icons sprite .icon
```

Generated CSS usage:
```html
<span class="sprite sprite-arrow-left"></span>
```

---

### `placeholder` — LQIP placeholder

Generates a tiny (20px wide) blurred image for lazy-loading placeholders. Prints a base64 data URI to stdout.

```bash
asset-forge placeholder <image> [output.png]
```

```bash
# Print data URI
asset-forge placeholder hero.jpg

# Save PNG + print data URI
asset-forge placeholder hero.jpg hero-placeholder.png

# Capture into a variable
DATA_URI=$(asset-forge placeholder hero.jpg)
```

Use the data URI as an `src` or CSS `background-image` to show while the full image loads.

---

### `strip-meta` — Strip EXIF metadata

Removes all EXIF/metadata from images in-place. Uses `exiftool` if available, falls back to ImageMagick.

```bash
asset-forge strip-meta <file_or_dir>
```

```bash
asset-forge strip-meta photo.jpg
asset-forge strip-meta ./uploads
```

---

### `thumbnail` — Batch thumbnails

Batch generates center-cropped thumbnails from a directory, preserving folder structure.

```bash
asset-forge thumbnail <src_dir> <dest_dir> [size] [gravity]
```

| Arg | Default | Description |
|-----|---------|-------------|
| `size` | `400x400` | Output dimensions as `WxH` |
| `gravity` | `Center` | Crop anchor: `Center`, `North`, `South`, etc. |

```bash
asset-forge thumbnail ./photos ./thumbs
asset-forge thumbnail ./photos ./thumbs 800x600
asset-forge thumbnail ./photos ./thumbs 400x400 North
```

---

### `promo` — Marketing promo images

Generates a full set of marketing assets from a background image, logo, headline, and subtitle.

```bash
asset-forge promo -b <background> -l <logo> -t <headline> [-s <subtitle>] [-c <overlay>] [-f <text_color>] [-o <output_dir>]
```

| Flag | Default | Description |
|------|---------|-------------|
| `-b` | required | Background image |
| `-l` | required | Logo image |
| `-t` | required | Headline text |
| `-s` | — | Subtitle text |
| `-c` | `rgba(0,0,0,0.45)` | Overlay color/opacity for readability |
| `-f` | `white` | Text color |
| `-o` | `./promo` | Output directory |

```bash
asset-forge promo -b background.jpg -l logo.png -t "Your App Name" -s "The tagline that sells it"
asset-forge promo -b bg.jpg -l logo.png -t "Launch Sale" -s "50% off today only" -c "rgba(0,0,80,0.6)" -o ./marketing
```

Outputs:

| File | Size | Use |
|------|------|-----|
| `promo-appstore-iphone.png` | 1290×2796 | App Store (iPhone 15 Pro Max) |
| `promo-appstore-ipad.png` | 2048×1536 | App Store (iPad landscape) |
| `promo-social-square.png` | 1080×1080 | Instagram / Facebook post |
| `promo-social-story.png` | 1080×1920 | Stories / Reels / TikTok |
| `promo-twitter-banner.png` | 1500×500 | Twitter/X profile banner |
| `promo-og.png` | 1200×630 | Open Graph / LinkedIn share |

> Tip: fonts are auto-detected. To use a custom font see the [Configuration](#configuration) section.

---

### `audit` — Audit image directory

Scans a directory and reports potential issues.

```bash
asset-forge audit <dir> [size_threshold_kb]
```

Checks for:
- Files over the size threshold (default: 200KB)
- PNG/JPG files that could be converted to WebP/AVIF
- Animated GIFs that should be video or WebP
- Missing `@2x` retina variants
- Suspiciously small images (<10px)

```bash
asset-forge audit ./public/images
asset-forge audit ./public/images 100
```

---

### `srcset` — Retina image variants

Generates `@1x`, `@2x`, `@3x` variants and prints the ready-to-use HTML `srcset` attribute.

```bash
asset-forge srcset <image> [output_dir] [scales]
# scales: comma-separated, default "1,2,3"

asset-forge srcset hero.png ./img
asset-forge srcset logo.png ./img 1,2       # skip @3x
```

---

### `gif-to-video` — GIF to video

Converts an animated GIF to `.mp4` + `.webm` for web performance. Prints the HTML `<video>` snippet.

```bash
asset-forge gif-to-video <input.gif> [output_dir]

asset-forge gif-to-video animation.gif ./video
```

---

### `video-to-gif` — Video to GIF

Converts a video clip to an optimized GIF using a 2-pass palette approach for best color quality.

```bash
asset-forge video-to-gif <input_video> [output.gif] [fps] [width]

asset-forge video-to-gif demo.mp4
asset-forge video-to-gif demo.mp4 demo.gif 12 320   # 12fps, 320px wide
```

---

### `convert-video` — Convert video formats

Converts between `.mp4`, `.webm`, `.mov`, and `.gif`. Format is inferred from the output extension.

```bash
asset-forge convert-video <input> <output.ext> [quality]
# quality: CRF value 0-51 (lower = better), default 23

asset-forge convert-video clip.mov output.mp4
asset-forge convert-video clip.mp4 output.webm
asset-forge convert-video clip.mp4 output.gif
```

---

### `blur-hash` — BlurHash placeholder

Generates a [BlurHash](https://blurha.sh) string for use as a compact image placeholder.

```bash
asset-forge blur-hash <image>
# Requires: pip install Pillow blurhash

asset-forge blur-hash hero.jpg
# → prints: LGF5?xYk^6#M@-5c,1J5@[or[Q6.
```

Set `X_COMPONENTS` and `Y_COMPONENTS` env vars to control detail (default: 4x3).

---

### `device-frame` — Device mockup frame

Wraps a screenshot in a device frame. Great for App Store listings and marketing assets.

```bash
asset-forge device-frame <screenshot> [output.png] [device]
# device: iphone (default), android, browser

asset-forge device-frame screenshot.png framed.png
asset-forge device-frame screenshot.png framed.png browser
```

---

### `feature-graphic` — Google Play feature graphic

Generates a Google Play Store feature graphic (1024×500).

```bash
asset-forge feature-graphic -b <bg> -t <headline> [-l logo] [-s subtitle] [-o output.png]

asset-forge feature-graphic -b bg.jpg -l logo.png -t "App Name" -s "Tagline"
```

---

### `watermark` — Bulk watermark

Adds a logo or text watermark to all images in a directory.

```bash
asset-forge watermark <src_dir> <dest_dir> [-l logo] [-t text] [-p position] [-o opacity]
# position: SouthEast (default), NorthEast, SouthWest, NorthWest, Center
# opacity: 0-100, default 70

asset-forge watermark ./photos ./watermarked -l logo.png
asset-forge watermark ./photos ./watermarked -t "© 2025 MyApp" -p SouthWest -o 50
```

---

### `github-social` — GitHub social preview

Generates a GitHub repository social preview image (1280×640).

```bash
asset-forge github-social -b <bg> -t <headline> [-l logo] [-s subtitle] [-o output.png]

asset-forge github-social -b bg.jpg -l logo.png -t "my-repo" -s "What it does in one line"
```

Upload at: **Settings → Social preview → Edit → Upload image**

---

### `email-banner` — Email header banner

Generates an email header banner at 600×200 — the standard email client width.

```bash
asset-forge email-banner -b <bg> [-l logo] [-t headline] [-s subtitle] [-o output.png]

asset-forge email-banner -b bg.jpg -l logo.png -t "We just launched!" -s "Check it out"
```

---

### `montage` — Image grid / collage

Arranges a folder of images into a grid.

```bash
asset-forge montage <images_dir> [output.png] [columns] [tile_size] [gap]

asset-forge montage ./screenshots
asset-forge montage ./screenshots collage.png 3 600x600 20
```

---

### `info` — Image inspector

Prints dimensions, format, file size, color space, and EXIF data for one or more images.

```bash
asset-forge info <image> [image2 ...]

asset-forge info photo.jpg
asset-forge info *.png
```

---

### `compare` — Visual diff

Creates a labeled side-by-side (or top/bottom) comparison of two images.

```bash
asset-forge compare <image_a> <image_b> [output.png] [horizontal|vertical]

asset-forge compare before.png after.png diff.png
asset-forge compare original.jpg optimized.jpg diff.png vertical
```

---

### `palette` — Extract dominant colors

Extracts the N most dominant colors from an image as hex codes. Optionally saves a swatch PNG.

```bash
asset-forge palette <image> [num_colors] [swatch.png]

asset-forge palette logo.png              # prints 6 hex codes
asset-forge palette photo.jpg 8 swatch.png
```

---

### `trim` — Auto-trim borders

Removes transparent or near-white/black borders from images. Great for cleaning up logo exports.

```bash
asset-forge trim <file_or_dir> [output_dir] [fuzz]
# fuzz: color tolerance 0-100%, default 5

asset-forge trim logo.png                    # in-place
asset-forge trim logo.png trimmed.png
asset-forge trim ./exports ./trimmed 10      # batch, 10% tolerance
```

---

### `shadow` — Drop shadow

Adds a drop shadow to a PNG image. Output always PNG to preserve transparency.

```bash
asset-forge shadow <input> [output.png] [blur] [opacity] [offset_x] [offset_y] [color]

asset-forge shadow icon.png                          # defaults: blur=20 opacity=80 offset=10,10
asset-forge shadow icon.png shadow.png 30 60 15 15
asset-forge shadow icon.png shadow.png 20 90 0 0 "#333333"  # centered dark shadow
```

---

### `round-corners` — Rounded corners

Applies rounded corners to any image. Output is PNG with transparency.

```bash
asset-forge round-corners <input> [output.png] [radius]
# radius: px value or percentage, default "10%"

asset-forge round-corners photo.jpg rounded.png
asset-forge round-corners photo.jpg rounded.png 24    # 24px radius
asset-forge round-corners photo.jpg rounded.png 15%   # 15% of width
```

---

### `border` — Add border

Adds a solid border/stroke around images.

```bash
asset-forge border <file_or_dir> [output_dir] [size] [color]

asset-forge border photo.jpg                        # 4px black border, in-place
asset-forge border photo.jpg bordered.jpg 8 white
asset-forge border ./photos ./bordered 2 "#FF0000"  # batch, 2px red
```

---

### `add-text` — Text overlay

Adds a text overlay to an image. Simpler than `promo` — just text on top of one image.

```bash
asset-forge add-text <input> <text> [output.png] [gravity] [size] [color] [font]
# gravity: South (default), North, Center, NorthWest, SouthEast, etc.

asset-forge add-text photo.jpg "Hello World"
asset-forge add-text photo.jpg "© 2025" caption.jpg South 32 white
```

---

### `trim-video` — Trim video

Cuts a video clip to a start/end time. Uses stream copy (no re-encode) so it's instant.

```bash
asset-forge trim-video <input> <start> <end> [output]
# Times: HH:MM:SS, MM:SS, or plain seconds

asset-forge trim-video demo.mp4 0:30 1:45
asset-forge trim-video demo.mp4 90 150 clip.mp4
```

---

### `extract-frames` — Extract video frames

Pulls frames out of a video as numbered PNG files.

```bash
asset-forge extract-frames <video> [output_dir] [mode]
# mode: 1 (1fps, default), 0.5 (1 every 2s), 24 (24fps), all (every frame)

asset-forge extract-frames demo.mp4
asset-forge extract-frames demo.mp4 ./frames all    # every frame
asset-forge extract-frames demo.mp4 ./frames 0.25  # 1 frame every 4 seconds
```

---

### `compress-video` — Compress video

Shrinks a video for sharing. Two modes: target file size or quality-based.

```bash
asset-forge compress-video <input> [output] [target_mb]

asset-forge compress-video video.mp4                    # quality mode (720p max, CRF 28)
asset-forge compress-video video.mp4 small.mp4 8        # target 8MB (WhatsApp limit)
asset-forge compress-video video.mp4 email.mp4 25       # target 25MB (email limit)
```

---

### `pwa-icons` — PWA icon set

Generates a complete PWA icon set including maskable variants with the correct safe zone, plus a `manifest.json` snippet.

```bash
asset-forge pwa-icons <logo> [output_dir] [bg_color]

asset-forge pwa-icons logo.png
asset-forge pwa-icons logo.png ./pwa "#1a1a2e"   # dark background for maskable icons
```

Merge the generated `manifest.json` icons array into your site's `manifest.json`.

---

### `resize` — Batch resize

Resizes images using ImageMagick spec syntax.

```bash
asset-forge resize <file_or_dir> <spec> [output_dir]

asset-forge resize hero.jpg 1200          # 1200px wide, height auto
asset-forge resize hero.jpg 1200x630      # fit within box, preserve ratio
asset-forge resize hero.jpg 1200x630!     # force exact size (may distort)
asset-forge resize hero.jpg 1200x630^     # fill and crop to 1200x630
asset-forge resize hero.jpg 50%           # scale to 50%
asset-forge resize ./photos 800 ./thumbs  # batch
```

---

### `rename` — Batch rename

Renames images in a directory. Supports prefix, suffix, slugify, and sequential numbering.

```bash
asset-forge rename <dir> [options]

asset-forge rename ./photos --slugify                    # "My Photo 1.jpg" → "my-photo-1.jpg"
asset-forge rename ./exports --prefix "app-" --slugify   # → "app-icon-dark.png"
asset-forge rename ./shots --sequence                    # → "0001.jpg", "0002.jpg" ...
asset-forge rename ./shots --sequence 10                 # start from 0010
asset-forge rename ./shots --prefix "hero-" --dry-run   # preview without renaming
```

---

### `duplicates` — Find duplicate images

Detects visually similar images using perceptual hashing (dHash). Finds near-dupes even if resized or slightly edited.

```bash
asset-forge duplicates <dir> [threshold]
# threshold: 0-64 hamming distance, default 6 (0 = exact pixel-identical)
# Requires: pip install Pillow

asset-forge duplicates ./photos
asset-forge duplicates ./photos 0    # exact duplicates only
asset-forge duplicates ./photos 12   # more lenient (catches crops/resizes)
```

---

### `convert` — Convert image format

Converts a single image to any format. Uses native encoders (`avifenc`, `cwebp`) when available.

```bash
asset-forge convert <input> <output.ext> [quality]

asset-forge convert logo.png logo.webp
asset-forge convert photo.jpg photo.avif 85
asset-forge convert image.webp image.png
```

## License

MIT
