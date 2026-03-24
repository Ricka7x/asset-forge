import { defineCommand } from 'citty'
import { join } from 'path'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { composeMarketingAsset } from '../lib/canvas'
import { getOutDir } from '../config'

export interface MarketingOptions {
  background: string
  logo: string
  title: string
  subtitle?: string
  output?: string
  theme?: 'light' | 'dark'
  color?: string
}

export default defineCommand({
  meta: {
    name: 'promo',
    description: 'Generate marketing assets suite (App Store, Social, OG, etc.)',
  },
  args: {
    background: { type: 'string',     alias: 'b', description: 'Background image', required: true },
    logo:       { type: 'string',     alias: 'l', description: 'Logo image',       required: true },
    title:      { type: 'string',     alias: 't', description: 'Headline text',    required: true },
    subtitle:   { type: 'string',     alias: 's', description: 'Subtitle text' },
    output:     { type: 'string',     alias: 'o', description: 'Output directory' },
    theme:      { type: 'string',     alias: 'm', description: 'light|dark', default: 'dark' },
    color:      { type: 'string',     alias: 'c', description: 'Overlay color (hex/rgba)' },
  },
  async run({ args }) {
    await promo(args as any)
  }
})

export async function promo(args: MarketingOptions) {
    const outDir = args.output || join(getOutDir(), 'promo')
    if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

    console.log(`Generating promo assets into → ${outDir}/`)

    const SIZES = [
      { name: 'appstore-iphone.png', w: 1290, h: 2796, lp: 300, ly: 180, hy: 560, sy: 720, hpt: 120, spt: 60 },
      { name: 'appstore-ipad.png',   w: 2048, h: 1536, lp: 260, ly: 200, hy: 560, sy: 700, hpt: 110, spt: 54 },
      { name: 'social-square.png',  w: 1080, h: 1080, lp: 200, ly: 140, hy: 420, sy: 540, hpt: 90,  spt: 44 },
      { name: 'social-story.png',   w: 1080, h: 1920, lp: 220, ly: 260, hy: 680, sy: 820, hpt: 100, spt: 50 },
      { name: 'twitter-banner.png', w: 1500, h: 500,  lp: 120, ly: 80,  hy: 200, sy: 290, hpt: 72,  spt: 36 },
      { name: 'og-image.png',       w: 1200, h: 630,  lp: 160, ly: 90,  hy: 280, sy: 380, hpt: 80,  spt: 40 },
    ]

    for (const s of SIZES) {
      const buf = await composeMarketingAsset({
        width: s.w, height: s.h,
        background: args.background,
        logo: args.logo,
        headline: args.title,
        subtitle: args.subtitle,
        theme: args.theme,
        overlayColor: args.color || (args.theme === 'dark' ? 'rgba(0,0,0,0.45)' : undefined),
        logoPx: s.lp, logoY: s.ly,
        headlineY: s.hy, subtitleY: s.sy,
        headlinePt: s.hpt, subtitlePt: s.spt
      })
      const path = join(outDir, `promo-${s.name}`)
      writeFileSync(path, buf)
      console.log(`  ✓ ${s.name} (${s.w}x${s.h})`)
    }

    console.log(`\nDone! Saved all promo assets to ${outDir}/`)
    return { files: [outDir] }
}
