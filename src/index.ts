import { setConfig } from './config'

export interface ForgeConfig {
  quality?: number
  outDir?: string
  fontBold?: string
  fontRegular?: string
}

/** Configure global defaults for asset-forge. */
export function configure(opts: ForgeConfig) {
  if (opts.outDir) setConfig('outDir', opts.outDir)
  if (opts.fontBold) setConfig('fontBold', opts.fontBold)
  if (opts.fontRegular) setConfig('fontRegular', opts.fontRegular)
}

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface OptimizeOptions { quality?: number }
export interface ResizeOptions { output?: string }
export interface ThumbnailOptions { size?: string; gravity?: string }
export interface ConvertOptions { quality?: number }
export interface ShadowOptions { blur?: number; opacity?: number; offsetX?: number; offsetY?: number; color?: string }
export interface RoundCornersOptions { radius?: string | number }
export interface BorderOptions { output?: string; size?: number; color?: string }
export interface PaletteOptions { count?: number; swatch?: string }
export interface OgImageOptions { title: string; subtitle?: string; background?: string; output?: string; theme?: 'light' | 'dark'; gravity?: string }
export interface FaviconOptions { icoOnly?: boolean }
export interface AppIconsOptions { platform?: 'ios' | 'android' | 'macos' }
export interface MarketingOptions { background: string; logo: string; title: string; subtitle?: string; output?: string; theme?: 'light' | 'dark'; color?: string }
export interface VideoOptions { fps?: number; width?: number; targetMb?: number }

// ─── Image ────────────────────────────────────────────────────────────────────

export async function optimize(src: string, dest?: string | OptimizeOptions, opts?: OptimizeOptions) {
  const m = await import('./commands/optimize')
  return m.optimize(src, dest, opts)
}

export async function resize(input: string, spec: string | number, output?: string) {
  const m = await import('./commands/resize')
  return m.resize(input, spec, output)
}

export async function thumbnail(src: string, dest?: string, size?: string, gravity?: string) {
  const m = await import('./commands/thumbnail')
  return m.thumbnail(src, dest, size, gravity)
}

export async function convert(input: string, output: string, opts?: ConvertOptions) {
  const m = await import('./commands/convert')
  return m.convert(input, output, opts)
}

export async function shadow(input: string, output?: string, opts?: ShadowOptions) {
  const m = await import('./commands/shadow')
  return m.shadow(input, output, opts)
}

export async function roundCorners(input: string, output?: string, radius?: string | number) {
  const m = await import('./commands/round-corners')
  return m.roundCorners(input, output, { radius })
}

export async function border(input: string, output?: string, size?: number, color?: string) {
  const m = await import('./commands/border')
  return m.border(input, { output, size, color })
}

export async function palette(imagePath: string, opts?: PaletteOptions) {
  const m = await import('./commands/palette')
  return m.palette(imagePath, opts)
}

export async function blurHash(imagePath: string, x?: number, y?: number) {
  const m = await import('./commands/blur-hash')
  return m.blurHash(imagePath, x, y)
}

export async function info(images: string | string[]) {
  const m = await import('./commands/info')
  return m.info(images)
}

// ─── Web & Icons ──────────────────────────────────────────────────────────────

export async function ogImage(opts: OgImageOptions) {
  const m = await import('./commands/og-image')
  return m.ogImage(opts)
}

export async function favicon(logo: string, dest?: string, opts?: FaviconOptions) {
  const m = await import('./commands/favicon')
  return m.favicon(logo, dest, opts)
}

export async function appIcons(logo: string, dest?: string, opts?: AppIconsOptions) {
  const m = await import('./commands/app-icons')
  return m.appIcons(logo, dest, opts)
}

export async function pwaIcons(logo: string, dest?: string) {
  const m = await import('./commands/pwa-icons')
  return m.pwaIcons(logo, dest)
}

// ─── Marketing ────────────────────────────────────────────────────────────────

export async function promo(opts: MarketingOptions) {
  const m = await import('./commands/promo')
  return m.promo(opts)
}

export async function featureGraphic(opts: MarketingOptions) {
  const m = await import('./commands/feature-graphic')
  return m.featureGraphic(opts)
}

export async function githubSocial(opts: MarketingOptions) {
  const m = await import('./commands/github-social')
  return m.githubSocial(opts)
}

export async function emailBanner(opts: MarketingOptions) {
  const m = await import('./commands/email-banner')
  return m.emailBanner(opts)
}

// ─── Video ────────────────────────────────────────────────────────────────────

export async function gifToVideo(input: string, output?: string) {
  const m = await import('./commands/gif-to-video')
  return m.gifToVideo(input, output)
}

export async function videoToGif(input: string, output?: string, fps?: number, width?: number) {
  const m = await import('./commands/video-to-gif')
  return m.videoToGif(input, output, { fps, width })
}

export async function compressVideo(input: string, output?: string, targetMb?: number) {
  const m = await import('./commands/compress-video')
  return m.compressVideo(input, output, targetMb)
}

export async function extractFrames(video: string, dest?: string, mode?: string | number) {
  const m = await import('./commands/extract-frames')
  return m.extractFrames(video, dest, mode)
}
