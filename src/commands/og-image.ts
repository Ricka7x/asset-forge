import { resolveOutput } from '../lib/output'
import { defineCommand } from 'citty'
import { composeMarketingAsset } from '../lib/canvas'
import { writeFileSync } from 'fs'

export interface OgImageOptions {
  title: string
  subtitle?: string
  background?: string
  logo?: string
  output?: string
  theme?: 'light' | 'dark'
  gravity?: string
}

export default defineCommand({
  meta: {
    name: 'og-image',
    description: 'Generate social sharing image (1200x630)',
  },
  args: {
    title:      { type: 'positional', description: 'Main title', required: false },
    background: { type: 'string',     alias: 'b', description: 'Background image/color' },
    logo:       { type: 'string',     alias: 'l', description: 'Logo image' },
    subtitle:   { type: 'string',     alias: 's', description: 'Subtitle text' },
    output:     { type: 'string',     alias: 'o', description: 'Output path' },
    gravity:    { type: 'string',     alias: 'g', description: 'Text gravity', default: 'Center' },
    theme:      { type: 'string',     alias: 't', description: 'light|dark',  default: 'dark' },
  },
  async run({ args }) {
    await ogImage({
      title:  args.title || 'Asset Forge',
      background: args.background,
      logo: args.logo,
      subtitle: args.subtitle,
      output: args.output,
      gravity: args.gravity,
      theme: args.theme as any
    })
  }
})

export async function ogImage(opts: OgImageOptions) {
  const finalPath = resolveOutput({ input: opts.background || 'og-image.png', output: opts.output, extension: '.png', suffix: '-og' })

  const buf = await composeMarketingAsset({
    width: 1200, height: 630,
    background: opts.background,
    logo: opts.logo,
    headline: opts.title,
    subtitle: opts.subtitle,
    theme: opts.theme,
    overlayColor: opts.theme === 'dark' ? 'rgba(0,0,0,0.35)' : undefined,
    logoPx: 120, logoY: 60,
    headlinePt: 80, subtitlePt: 40,
  })

  writeFileSync(finalPath, buf)
  console.log(`OG Image generated → ${finalPath}`)
  return { files: [finalPath] }
}
