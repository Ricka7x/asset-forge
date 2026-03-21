import { defineCommand, runMain } from 'citty'
import { printBanner } from './banner'
import * as commands from './commands'

printBanner()

const main = defineCommand({
  meta: {
    name: 'asset-forge',
    description: 'The complete asset toolkit for developers',
  },
  run() {
    console.log('  Run asset-forge --help to see available commands.\n')
  },
  subCommands: {
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
    'ico':             commands.ico,
    'appiconset':      commands.appiconset,
    'ios-icons':       commands.iosIcons,
    'android-icons':   commands.androidIcons,
    'pwa-icons':       commands.pwaIcons,
    'sprites':         commands.sprites,
    // ── Marketing & Store ──────────────────────────────────
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
  },
})

runMain(main)
