import { defineCommand, type ArgsDef } from 'citty'
import { join, dirname, resolve, isAbsolute } from 'path'
import { existsSync, mkdirSync } from 'fs'
import { getOutDir } from './config'

function findScriptsDir(): string {
  // 1. Running from source: bun run src/cli.ts
  const fromSrc = join(import.meta.dir, '../scripts')
  if (existsSync(fromSrc)) return fromSrc

  // 2. Installed via Homebrew: binary at bin/, scripts at libexec/asset-forge/scripts/
  const fromBrew = join(dirname(process.execPath), '..', 'libexec', 'asset-forge', 'scripts')
  if (existsSync(fromBrew)) return fromBrew

  // 3. Compiled binary run from the repo root (CI, local dist testing)
  return join(process.cwd(), 'scripts')
}

const SCRIPTS_DIR = findScriptsDir()

function sh(name: string, script: string, description: string, args: ArgsDef = {}) {
  return defineCommand({
    meta: { name, description },
    args,
    run() {
      const outDir = getOutDir()
      mkdirSync(outDir, { recursive: true })

      // Resolve any existing file/dir paths in argv to absolute so scripts
      // can find them after we change the working directory.
      const raw = process.argv.slice(3).map(arg => {
        if (arg.startsWith('-')) return arg
        const abs = isAbsolute(arg) ? arg : resolve(process.cwd(), arg)
        return existsSync(abs) ? abs : arg
      })

      const proc = Bun.spawnSync(['bash', join(SCRIPTS_DIR, `${script}.sh`), ...raw], {
        stdio: ['inherit', 'inherit', 'inherit'],
        cwd: outDir,
      })
      process.exit(proc.exitCode ?? 0)
    },
  })
}

// ─── Image ────────────────────────────────────────────────────────────────────

export const optimize = sh('optimize', 'optimize-images', 'Compress images to AVIF/WebP', {
  src:     { type: 'positional', description: 'Source directory',      required: true },
  dest:    { type: 'positional', description: 'Destination directory', required: true },
  quality: { type: 'positional', description: 'Quality 1-100',         default: '95' },
})

export const resize = sh('resize', 'resize', 'Resize images', {
  input:  { type: 'positional', description: 'File or directory',                       required: true },
  spec:   { type: 'positional', description: 'Size spec: 800, 800x600, 50%, 800x600^', required: true },
  output: { type: 'positional', description: 'Output directory' },
})

export const thumbnail = sh('thumbnail', 'make-thumbnail', 'Generate center-cropped thumbnails', {
  src:     { type: 'positional', description: 'Source directory',      required: true },
  dest:    { type: 'positional', description: 'Destination directory', required: true },
  size:    { type: 'positional', description: 'Dimensions WxH',        default: '400x400' },
  gravity: { type: 'positional', description: 'Crop anchor: NorthWest, North, NorthEast, West, Center, East, SouthWest, South, SouthEast', default: 'Center' },
})

export const srcset = sh('srcset', 'srcset', 'Generate @1x/@2x/@3x retina variants', {
  image:  { type: 'positional', description: 'Source image',            required: true },
  output: { type: 'positional', description: 'Output directory' },
  scales: { type: 'positional', description: 'Comma-separated scales',  default: '1,2,3' },
})

export const placeholder = sh('placeholder', 'make-placeholder', 'Generate LQIP base64 placeholder', {
  image:  { type: 'positional', description: 'Source image', required: true },
  output: { type: 'positional', description: 'Output PNG path (optional, also prints data URI)' },
})

export const blurHash = sh('blur-hash', 'blur-hash', 'Compute BlurHash string for an image', {
  image: { type: 'positional', description: 'Source image', required: true },
})

export const palette = sh('palette', 'palette', 'Extract dominant color palette', {
  image:  { type: 'positional', description: 'Source image',           required: true },
  colors: { type: 'positional', description: 'Number of colors',       default: '6' },
  swatch: { type: 'positional', description: 'Save swatch PNG to this path', default: '' },
})

export const watermark = sh('watermark', 'watermark', 'Overlay a watermark on images', {
  src:      { type: 'positional', description: 'Source directory',      required: true },
  dest:     { type: 'positional', description: 'Destination directory', required: true },
  logo:     { type: 'string',     description: 'Logo image',            alias: 'l' },
  text:     { type: 'string',     description: 'Text watermark',        alias: 't' },
  position: { type: 'string',     description: 'SouthEast, NorthEast, SouthWest, NorthWest, Center', alias: 'p', default: 'SouthEast' },
  opacity:  { type: 'string',     description: 'Opacity 0-100',         alias: 'o', default: '70' },
})

export const shadow = sh('shadow', 'shadow', 'Add drop shadow to an image', {
  input:   { type: 'positional', description: 'Source image',  required: true },
  output:  { type: 'positional', description: 'Output PNG' },
  blur:    { type: 'positional', description: 'Blur radius',   default: '20' },
  opacity: { type: 'positional', description: 'Opacity 0-100', default: '80' },
  offsetX: { type: 'positional', description: 'X offset',      default: '10' },
  offsetY: { type: 'positional', description: 'Y offset',      default: '10' },
  color:   { type: 'positional', description: 'Shadow color',  default: 'black' },
})

export const border = sh('border', 'border', 'Add a border to images', {
  input:  { type: 'positional', description: 'File or directory', required: true },
  output: { type: 'positional', description: 'Output directory' },
  size:   { type: 'positional', description: 'Border size in px', default: '4' },
  color:  { type: 'positional', description: 'Border color',      default: 'black' },
})

export const roundCorners = sh('round-corners', 'round-corners', 'Apply rounded corners to an image', {
  input:  { type: 'positional', description: 'Source image',         required: true },
  output: { type: 'positional', description: 'Output PNG' },
  radius: { type: 'positional', description: 'Radius in px or %',   default: '10%' },
})

export const addText = sh('add-text', 'add-text', 'Overlay text onto an image', {
  input:   { type: 'positional', description: 'Source image',                    required: true },
  text:    { type: 'positional', description: 'Text to overlay',                 required: true },
  output:  { type: 'positional', description: 'Output file' },
  gravity: { type: 'positional', description: 'NorthWest, North, NorthEast, West, Center, East, SouthWest, South, SouthEast', default: 'South' },
  size:    { type: 'positional', description: 'Font size in px',                 default: '48' },
  color:   { type: 'positional', description: 'Text color',                      default: 'white' },
  font:    { type: 'positional', description: 'Font name', default: '' },
})

export const trim = sh('trim', 'trim', 'Auto-trim transparent/uniform borders', {
  input:  { type: 'positional', description: 'File or directory',     required: true },
  output: { type: 'positional', description: 'Output directory or file' },
  fuzz:   { type: 'positional', description: 'Color tolerance 0-100%', default: '5' },
})

export const montage = sh('montage', 'montage', 'Arrange images into a grid collage', {
  dir:      { type: 'positional', description: 'Images directory',  required: true },
  output:   { type: 'positional', description: 'Output PNG',         default: 'montage.png' },
  columns:  { type: 'positional', description: 'Number of columns',  default: '4' },
  tileSize: { type: 'positional', description: 'Tile size WxH',      default: '400x400' },
  gap:      { type: 'positional', description: 'Gap in px',          default: '10' },
})

export const compare = sh('compare', 'compare', 'Side-by-side visual diff of two images', {
  imageA:    { type: 'positional', description: 'First image',             required: true },
  imageB:    { type: 'positional', description: 'Second image',            required: true },
  output:    { type: 'positional', description: 'Output PNG',              default: 'compare.png' },
  direction: { type: 'positional', description: 'horizontal or vertical',  default: 'horizontal' },
})

export const stripMeta = sh('strip-meta', 'strip-metadata', 'Remove EXIF metadata from images', {
  input: { type: 'positional', description: 'File or directory', required: true },
})

export const audit = sh('audit', 'audit-images', 'Audit a folder for image issues', {
  dir:       { type: 'positional', description: 'Directory to audit',           required: true },
  threshold: { type: 'positional', description: 'Size warning threshold in KB', default: '200' },
})

export const info = sh('info', 'info', 'Show metadata and dimensions', {
  images: { type: 'positional', description: 'One or more image files', required: true },
})

export const deviceFrame = sh('device-frame', 'device-frame', 'Wrap a screenshot in a device frame', {
  input:  { type: 'positional', description: 'Screenshot image',              required: true },
  output: { type: 'positional', description: 'Output PNG' },
  device: { type: 'positional', description: 'iphone, android, or browser',  default: 'iphone' },
})

export const duplicates = sh('duplicates', 'duplicates', 'Find visually duplicate images', {
  dir:       { type: 'positional', description: 'Directory to scan',                     required: true },
  threshold: { type: 'positional', description: 'Hamming distance 0-64 (0 = exact)',     default: '6' },
})

export const rename = sh('rename', 'rename', 'Batch rename image files', {
  dir:      { type: 'positional', description: 'Directory to rename', required: true },
  prefix:   { type: 'string',     description: 'Add prefix to filenames' },
  suffix:   { type: 'string',     description: 'Add suffix to filenames' },
  slugify:  { type: 'boolean',    description: 'Convert names to slug-case' },
  sequence: { type: 'string',     description: 'Rename to sequential numbers, starting from N' },
  dryRun:   { type: 'boolean',    description: 'Preview changes without renaming', alias: 'n' },
})

export const convert = sh('convert', 'convert', 'Convert image to a different format', {
  input:   { type: 'positional', description: 'Source image',                  required: true },
  output:  { type: 'positional', description: 'Output file with target extension', required: true },
  quality: { type: 'positional', description: 'Quality 1-100',                 default: '90' },
})

// ─── Icons & Web ──────────────────────────────────────────────────────────────

export const ogImage = sh('og-image', 'make-og-image', 'Generate Open Graph image (1200×630)', {
  background: { type: 'string', description: 'Background image',                alias: 'b', required: true },
  headline:   { type: 'string', description: 'Headline text',                   alias: 't' },
  subtitle:   { type: 'string', description: 'Subtitle text',                   alias: 's' },
  logo:       { type: 'string', description: 'Logo image',                      alias: 'l' },
  output:     { type: 'string', description: 'Output file',                     alias: 'o', default: 'og-image.png' },
  gravity:    { type: 'string', description: 'NorthWest, North, NorthEast, West, Center, East, SouthWest, South, SouthEast', alias: 'g', default: 'Center' },
  overlay:    { type: 'string', description: 'Overlay color',                   alias: 'c', default: 'rgba(0,0,0,0.45)' },
  color:      { type: 'string', description: 'Text color',                      alias: 'f', default: 'white' },
})

export const favicon = sh('favicon', 'make-favicon', 'Generate favicon set + site.webmanifest', {
  logo:   { type: 'positional', description: 'Source logo image', required: true },
  output: { type: 'positional', description: 'Output directory' },
})

export const ico = sh('ico', 'make-ico', 'Generate .ico file', {
  logo:   { type: 'positional', description: 'Source logo image', required: true },
  output: { type: 'positional', description: 'Output .ico file',  default: 'favicon.ico' },
})

export const appiconset = sh('appiconset', 'make-appiconset', 'Generate macOS AppIcon.appiconset', {
  logo:   { type: 'positional', description: 'Source logo image', required: true },
  output: { type: 'positional', description: 'Output directory',  default: 'AppIcon.appiconset' },
})

export const iosIcons = sh('ios-icons', 'make-appiconset-ios', 'Generate iOS app icon set', {
  logo:   { type: 'positional', description: 'Source logo image', required: true },
  output: { type: 'positional', description: 'Output directory',  default: 'AppIcon.appiconset' },
})

export const androidIcons = sh('android-icons', 'make-appiconset-android', 'Generate Android mipmap icons', {
  logo:   { type: 'positional', description: 'Source logo image', required: true },
  output: { type: 'positional', description: 'Output directory',  default: 'app/src/main/res' },
})

export const pwaIcons = sh('pwa-icons', 'pwa-icons', 'Generate PWA icons + manifest snippet', {
  logo:    { type: 'positional', description: 'Source logo image',                       required: true },
  output:  { type: 'positional', description: 'Output directory' },
  bgColor: { type: 'positional', description: 'Background color for maskable icons',     default: '#ffffff' },
})

export const sprites = sh('sprites', 'make-sprites', 'Combine images into a sprite sheet + CSS', {
  dir:       { type: 'positional', description: 'Images directory', required: true },
  name:      { type: 'positional', description: 'Output base name', default: 'sprite' },
  cssPrefix: { type: 'positional', description: 'CSS class prefix', default: '.sprite' },
})

// ─── Marketing & Store ────────────────────────────────────────────────────────

export const promo = sh('promo', 'make-promo', 'Generate App Store + social promo art', {
  background: { type: 'string', description: 'Background image', alias: 'b', required: true },
  logo:       { type: 'string', description: 'Logo image',       alias: 'l', required: true },
  headline:   { type: 'string', description: 'Headline text',    alias: 't', required: true },
  subtitle:   { type: 'string', description: 'Subtitle text',    alias: 's' },
  overlay:    { type: 'string', description: 'Overlay color',    alias: 'c', default: 'rgba(0,0,0,0.45)' },
  color:      { type: 'string', description: 'Text color',       alias: 'f', default: 'white' },
  output:     { type: 'string', description: 'Output directory', alias: 'o', default: './promo' },
})

export const featureGraphic = sh('feature-graphic', 'make-feature-graphic', 'Generate Google Play feature graphic (1024×500)', {
  background: { type: 'string', description: 'Background image', alias: 'b', required: true },
  headline:   { type: 'string', description: 'Headline text',    alias: 't', required: true },
  logo:       { type: 'string', description: 'Logo image',       alias: 'l' },
  subtitle:   { type: 'string', description: 'Subtitle text',    alias: 's' },
  output:     { type: 'string', description: 'Output file',      alias: 'o', default: 'feature-graphic.png' },
})

export const githubSocial = sh('github-social', 'make-github-social', 'Generate GitHub social preview image (1280×640)', {
  background: { type: 'string', description: 'Background image', alias: 'b', required: true },
  headline:   { type: 'string', description: 'Headline text',    alias: 't', required: true },
  logo:       { type: 'string', description: 'Logo image',       alias: 'l' },
  subtitle:   { type: 'string', description: 'Subtitle text',    alias: 's' },
  output:     { type: 'string', description: 'Output file',      alias: 'o', default: 'github-social.png' },
})

export const emailBanner = sh('email-banner', 'make-email-banner', 'Generate email header banner (600×200)', {
  background: { type: 'string', description: 'Background image', alias: 'b', required: true },
  logo:       { type: 'string', description: 'Logo image',       alias: 'l' },
  headline:   { type: 'string', description: 'Headline text',    alias: 't' },
  subtitle:   { type: 'string', description: 'Subtitle text',    alias: 's' },
  output:     { type: 'string', description: 'Output file',      alias: 'o', default: 'email-banner.png' },
})

// ─── Video ────────────────────────────────────────────────────────────────────

export const gifToVideo = sh('gif-to-video', 'gif-to-video', 'Convert GIF to MP4/WebM', {
  input:  { type: 'positional', description: 'Source GIF',       required: true },
  output: { type: 'positional', description: 'Output directory', default: '.' },
})

export const videoToGif = sh('video-to-gif', 'video-to-gif', 'Convert video clip to optimized GIF', {
  input:  { type: 'positional', description: 'Source video',        required: true },
  output: { type: 'positional', description: 'Output GIF' },
  fps:    { type: 'positional', description: 'Frames per second',   default: '15' },
  width:  { type: 'positional', description: 'Output width in px',  default: '480' },
})

export const convertVideo = sh('convert-video', 'convert-video', 'Transcode video to a different format', {
  input:   { type: 'positional', description: 'Source video',                        required: true },
  output:  { type: 'positional', description: 'Output file (format from extension)', required: true },
  quality: { type: 'positional', description: 'CRF quality 0-51 (lower = better)',  default: '23' },
})

export const compressVideo = sh('compress-video', 'compress-video', 'Reduce video file size', {
  input:    { type: 'positional', description: 'Source video',    required: true },
  output:   { type: 'positional', description: 'Output file' },
  targetMb: { type: 'positional', description: 'Target file size in MB (omit for quality mode)' },
})

export const trimVideo = sh('trim-video', 'trim-video', 'Trim a video to a time range', {
  input:  { type: 'positional', description: 'Source video',                  required: true },
  start:  { type: 'positional', description: 'Start time (HH:MM:SS or secs)', required: true },
  end:    { type: 'positional', description: 'End time (HH:MM:SS or secs)',   required: true },
  output: { type: 'positional', description: 'Output file' },
})

export const extractFrames = sh('extract-frames', 'extract-frames', 'Export frames from a video as images', {
  input:  { type: 'positional', description: 'Source video',                   required: true },
  output: { type: 'positional', description: 'Output directory' },
  mode:   { type: 'positional', description: 'fps rate or "all" for every frame', default: '1' },
})

// ─── Config ───────────────────────────────────────────────────────────────────

import chalk from 'chalk'
import { getConfig, setConfig, getOutDir as _getOutDir } from './config'

export const configCmd = defineCommand({
  meta: { name: 'config', description: 'Manage forge configuration' },
  subCommands: {
    set: defineCommand({
      meta: { name: 'set', description: 'Set a config value' },
      args: {
        key:   { type: 'positional', description: 'Config key (e.g. outDir)', required: true },
        value: { type: 'positional', description: 'Value to set',             required: true },
      },
      run({ args }) {
        const valid = ['outDir', 'fontBold', 'fontRegular']
        if (!valid.includes(String(args.key))) {
          console.error(chalk.red(`Unknown config key: ${args.key}`))
          console.error(chalk.dim(`  Available keys: ${valid.join(', ')}`))
          process.exit(1)
        }
        setConfig(args.key as 'outDir' | 'fontBold' | 'fontRegular', String(args.value))
        console.log(chalk.green(`✓ ${args.key} → ${args.value}`))
      },
    }),
    get: defineCommand({
      meta: { name: 'get', description: 'Get a config value (or show all)' },
      args: {
        key: { type: 'positional', description: 'Config key (optional — omit to show all)', default: '' },
      },
      run({ args }) {
        const cfg = getConfig()
        if (args.key) {
          const val = cfg[args.key as keyof typeof cfg]
          console.log(val ?? chalk.dim('(not set)'))
        } else {
          const outDir = _getOutDir()
          const outSource = process.env.FORGE_OUT
            ? chalk.dim('(from FORGE_OUT)')
            : cfg.outDir
            ? chalk.dim('(from config)')
            : chalk.dim('(default: cwd)')
          console.log(`outDir       ${chalk.cyan(outDir)}  ${outSource}`)

          const fontBold = process.env.FORGE_FONT_BOLD ?? cfg.fontBold
          const fontRegular = process.env.FORGE_FONT_REGULAR ?? cfg.fontRegular
          const fontSource = (env: string | undefined, cfg: string | undefined) =>
            env ? chalk.dim('(from env)') : cfg ? chalk.dim('(from config)') : chalk.dim('(auto-detect)')
          console.log(`fontBold     ${chalk.cyan(fontBold ?? 'auto')}  ${fontSource(process.env.FORGE_FONT_BOLD, cfg.fontBold)}`)
          console.log(`fontRegular  ${chalk.cyan(fontRegular ?? 'auto')}  ${fontSource(process.env.FORGE_FONT_REGULAR, cfg.fontRegular)}`)
        }
      },
    }),
    reset: defineCommand({
      meta: { name: 'reset', description: 'Reset all config to defaults' },
      run() {
        setConfig('outDir', '')
        console.log(chalk.green('✓ Config reset to defaults'))
      },
    }),
  },
})
