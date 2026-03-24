import { defineCommand, runMain } from 'citty'
import { printBanner } from './banner'
import * as commands from './commands'
import chalk from 'chalk'
import { version } from '../package.json'

// ── Command groups (Canonical Grouping) ──────────────────────────────────────────

const GROUPS = [
  {
    label: 'Image',
    keys: [
      'optimize', 'resize', 'thumbnail', 'srcset', 'placeholder', 'blur-hash',
      'palette', 'watermark', 'shadow', 'border', 'round-corners', 'add-text',
      'trim', 'montage', 'compare', 'strip-meta', 'audit', 'info',
      'device-frame', 'duplicates', 'rename', 'convert'
    ],
  },
  {
    label: 'Icons & Web',
    keys: ['og-image', 'favicon', 'app-icons', 'pwa-icons', 'sprites'],
  },
  {
    label: 'Marketing',
    keys: ['promo', 'feature-graphic', 'github-social', 'email-banner'],
  },
  {
    label: 'Video',
    keys: ['gif-to-video', 'video-to-gif', 'convert-video', 'compress-video', 'trim-video', 'extract-frames'],
  },
  {
    label: 'Config',
    keys: ['config'],
  },
]

const SUB_COMMANDS = {
  // ── Image ──────────────────────────────────────────────
  'optimize':        commands.optimize,
  'resize':          commands.resize,
  'thumbnail':       commands.thumbnail,
  'srcset':          commands.srcset,
  'placeholder':     commands.placeholder,
  'blur-hash':       commands.blurHash,
  'palette':         commands.palette,
  'watermark':       commands.watermark,
  'shadow':          commands.shadow,
  'border':          commands.border,
  'round-corners':   commands.roundCorners,
  'add-text':        commands.addText,
  'trim':            commands.trim,
  'montage':         commands.montage,
  'compare':         commands.compare,
  'strip-meta':      commands.stripMeta,
  'audit':           commands.audit,
  'info':            commands.info,
  'device-frame':    commands.deviceFrame,
  'duplicates':      commands.duplicates,
  'rename':          commands.rename,
  'convert':         commands.convert,
  // ── Icons & Web ────────────────────────────────────────
  'og-image':        commands.ogImage,
  'favicon':         commands.favicon,
  'app-icons':       commands.appIcons,
  'pwa-icons':       commands.pwaIcons,
  'sprites':         commands.sprites,
  // ── Marketing ──────────────────────────────────────────
  'promo':           commands.promo,
  'feature-graphic': commands.featureGraphic,
  'github-social':   commands.githubSocial,
  'email-banner':    commands.emailBanner,
  // ── Video ──────────────────────────────────────────────
  'gif-to-video':    commands.gifToVideo,
  'video-to-gif':    commands.videoToGif,
  'convert-video':   commands.convertVideo,
  'compress-video':  commands.compressVideo,
  'trim-video':      commands.trimVideo,
  'extract-frames':  commands.extractFrames,
  // ── Config ─────────────────────────────────────────────
  'config':          commands.configCmd,
}

// ── Helper: Descriptions synchronized with User's Canonical List ───────────────

const DESCRIPTIONS: Record<string, string> = {
  'optimize':        'Compress images to AVIF/WebP',
  'resize':          'Resize images',
  'thumbnail':       'Generate center-cropped thumbnails',
  'srcset':          'Generate @1x/@2x/@3x retina variants',
  'placeholder':     'Generate LQIP base64 placeholder',
  'blur-hash':       'Compute BlurHash string for an image',
  'palette':         'Extract dominant color palette',
  'watermark':       'Overlay a watermark on images',
  'shadow':          'Add drop shadow to an image',
  'border':          'Add a border to images',
  'round-corners':   'Apply rounded corners to an image',
  'add-text':        'Overlay text onto an image',
  'trim':            'Auto-trim transparent/uniform borders',
  'montage':         'Arrange images into a grid collage',
  'compare':         'Side-by-side visual diff of two images',
  'strip-meta':      'Remove EXIF metadata from images',
  'audit':           'Audit an image or folder for issues',
  'info':            'Show metadata and dimensions',
  'device-frame':    'Wrap a screenshot in a device frame',
  'duplicates':      'Find visually duplicate images',
  'rename':          'Batch rename image files',
  'convert':         'Convert image to a different format',
  'og-image':        'Generate Open Graph image (1200×630)',
  'favicon':         'Generate favicon set + site.webmanifest (--ico-only for just the .ico)',
  'app-icons':       'Generate app icon set for macOS, iOS, or Android',
  'pwa-icons':       'Generate PWA icons + manifest snippet',
  'sprites':         'Combine images into a sprite sheet + CSS',
  'promo':           'Generate App Store + social promo art',
  'feature-graphic': 'Generate Google Play feature graphic (1024×500)',
  'github-social':   'Generate GitHub social preview image (1280×640)',
  'email-banner':    'Generate email header banner (600×200)',
  'gif-to-video':    'Convert GIF to MP4/WebM',
  'video-to-gif':    'Convert video clip to optimized GIF',
  'convert-video':   'Transcode video to a different format',
  'compress-video':  'Reduce video file size',
  'trim-video':      'Trim a video to a time range',
  'extract-frames':  'Export frames from a video as images',
  'config':          'Manage forge configuration',
}

function getDescription(key: string): string {
  return DESCRIPTIONS[key] || (SUB_COMMANDS[key as keyof typeof SUB_COMMANDS] as any)?.meta?.description || ''
}

function printGroupedHelp() {
  console.log(`\n  ${chalk.bold('forge')} ${chalk.dim(`v${version}`)}  —  ${Object.keys(SUB_COMMANDS).length} commands\n`)
  console.log(`  ${chalk.dim('USAGE')}  forge <command> [options]\n`)

  for (const group of GROUPS) {
    console.log(`  ${chalk.bold(group.label)}`)
    const maxLen = Math.max(...group.keys.map(k => k.length))
    for (const key of group.keys) {
      console.log(`    ${chalk.cyan(key.padEnd(maxLen))}    ${chalk.dim(getDescription(key))}`)
    }
    console.log()
  }

  console.log(`  ${chalk.dim('forge <command> --help')}   command-specific options\n`)
}

function printSummary() {
  const PREVIEW = 3
  console.log()
  for (const group of GROUPS) {
    if (group.label === 'Config') continue
    const shown = group.keys.slice(0, PREVIEW).map(k => chalk.cyan(k)).join('  ')
    const rest = group.keys.length - PREVIEW
    const more = rest > 0 ? chalk.dim(`  +${rest} more`) : ''
    console.log(`  ${chalk.bold(group.label.padEnd(12))}  ${shown}${more}`)
  }
  console.log()
  console.log(`  ${chalk.dim('forge --help')}         all commands`)
  console.log(`  ${chalk.dim('forge <command> -h')}   command help`)
  console.log()
}

// ── Intercept top-level --help before citty runs ───────────────────────────────

const rawArgs = process.argv.slice(2)
const isTopLevelHelp = rawArgs.length > 0 && rawArgs.every(a => a === '--help' || a === '-h')
const isVersion = rawArgs.length > 0 && rawArgs.every(a => a === '--version' || a === '-v')
const isZeroArg = rawArgs.length === 0

if (isVersion) {
  console.log(version)
  process.exit(0)
}

if (isTopLevelHelp) {
  printGroupedHelp()
  process.exit(0)
}

if (isZeroArg) {
  printBanner()
}

// ── Main command ───────────────────────────────────────────────────────────────

const main = defineCommand({
  meta: {
    name: 'asset-forge',
    description: 'The complete asset toolkit for developers',
  },
  run() {
    printSummary()
  },
  subCommands: SUB_COMMANDS as any,
})

runMain(main)
