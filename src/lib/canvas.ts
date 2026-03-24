import { GlobalFonts, createCanvas, loadImage, Image } from '@napi-rs/canvas'
import { join } from 'path'
import { existsSync } from 'fs'
import { getConfig } from '../config'

let initialized = false

/** Resolves and initializes fonts for canvas drawing. */
export function initCanvas() {
  if (!initialized) {
    const config = getConfig()
    const bundledDir = join(process.cwd(), 'assets/fonts')
    
    // Priority 1: Bundled Inter (bundled for CI/CD consistency)
    if (existsSync(bundledDir)) {
      GlobalFonts.loadFontsFromDir(bundledDir)
    }
    
    // Priority 2: Config/Env paths (manual override)
    const boldPath = process.env.FORGE_FONT_BOLD || config.fontBold
    if (boldPath && existsSync(boldPath)) GlobalFonts.registerFromPath(boldPath, 'Inter-Bold')
    
    const regPath = process.env.FORGE_FONT_REGULAR || config.fontRegular
    if (regPath && existsSync(regPath)) GlobalFonts.registerFromPath(regPath, 'Inter-Regular')

    initialized = true
  }
  return { createCanvas, loadImage, Image }
}

/** Draws wrapped text on a canvas context. */
export function drawWrappedText(ctx: any, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(' ')
  let line = ''
  let currentY = y

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' '
    const metrics = ctx.measureText(testLine)
    const testWidth = metrics.width
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, currentY)
      line = words[n] + ' '
      currentY += lineHeight
    } else {
      line = testLine
    }
  }
  ctx.fillText(line.trim(), x, currentY)
  return currentY + lineHeight
}

/** Professional marketing asset compositor. */
export async function composeMarketingAsset(opts: {
  width: number,
  height: number,
  background?: string,
  logo?: string,
  headline: string,
  subtitle?: string,
  theme?: 'dark' | 'light',
  overlayColor?: string,
  textColor?: string,
  logoPx?: number,
  logoY?: number,
  headlineY?: number,
  subtitleY?: number,
  headlinePt?: number,
  subtitlePt?: number
}) {
  const { createCanvas, loadImage } = initCanvas()
  const canvas = createCanvas(opts.width, opts.height)
  const ctx = canvas.getContext('2d')

  // 1. Background
  if (opts.background && existsSync(opts.background)) {
    const bg = await loadImage(opts.background)
    const aspect = bg.width / bg.height
    const targetAspect = opts.width / opts.height
    
    let dw, dh
    if (aspect > targetAspect) {
      dh = opts.height
      dw = opts.height * aspect
    } else {
      dw = opts.width
      dh = opts.width / aspect
    }
    ctx.drawImage(bg, (opts.width - dw) / 2, (opts.height - dh) / 2, dw, dh)
  } else {
    ctx.fillStyle = opts.theme === 'light' ? '#eee' : '#111'
    ctx.fillRect(0, 0, opts.width, opts.height)
    if (opts.background && opts.background.startsWith('#')) {
       ctx.fillStyle = opts.background
       ctx.fillRect(0, 0, opts.width, opts.height)
    }
  }

  // 2. Overlay
  if (opts.overlayColor) {
    ctx.fillStyle = opts.overlayColor
    ctx.fillRect(0, 0, opts.width, opts.height)
  }

  // 3. Logo
  if (opts.logo && existsSync(opts.logo)) {
    const logoImg = await loadImage(opts.logo)
    const lPx = opts.logoPx || 200
    const lY = opts.logoY || (opts.height * 0.15)
    
    const lAspect = logoImg.width / logoImg.height
    let lw = lPx, lh = lPx / lAspect
    if (lh > lPx) { lh = lPx; lw = lPx * lAspect }
    
    ctx.drawImage(logoImg, (opts.width - lw) / 2, lY, lw, lh)
  }

  // 4. Text
  const tColor = opts.textColor || (opts.theme === 'light' ? '#000' : '#fff')
  ctx.fillStyle = tColor
  ctx.textAlign = 'center'
  const textAreaW = opts.width * 0.85

  // Headline
  const hPt = opts.headlinePt || Math.floor(opts.width / 15)
  const hY = opts.headlineY || (opts.height / 2)
  ctx.font = `bold ${hPt}px Inter, "Inter-Bold", sans-serif`
  const nextY = drawWrappedText(ctx, opts.headline, opts.width / 2, hY, textAreaW, hPt * 1.2)

  // Subtitle
  if (opts.subtitle) {
    const sPt = opts.subtitlePt || Math.floor(hPt / 2)
    const sY = opts.subtitleY || nextY
    ctx.font = `${sPt}px Inter, "Inter-Regular", sans-serif`
    drawWrappedText(ctx, opts.subtitle, opts.width / 2, sY, textAreaW, sPt * 1.3)
  }

  return canvas.toBuffer('image/png')
}

export { createCanvas, loadImage, Image }
