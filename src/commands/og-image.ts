import { resolveOutput } from '../lib/output'
import { defineCommand } from 'citty'
import { initCanvas } from '../lib/canvas'
import { existsSync, writeFileSync } from 'fs'

export interface OgImageOptions {
  title: string
  subtitle?: string
  background?: string
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
    subtitle:   { type: 'string',     alias: 's', description: 'Subtitle text' },
    output:     { type: 'string',     alias: 'o', description: 'Output path' },
    gravity:    { type: 'string',     alias: 'g', description: 'Text gravity', default: 'Center' },
    theme:      { type: 'string',     alias: 't', description: 'light|dark',  default: 'dark' },
  },
  async run({ args }) {
    await ogImage({
      title:  args.title || 'Asset Forge',
      background: args.background,
      subtitle: args.subtitle,
      output: args.output,
      gravity: args.gravity,
      theme: args.theme as any
    })
  }
})

export async function ogImage(opts: OgImageOptions) {
  const { createCanvas, loadImage } = await initCanvas()
  const finalPath = resolveOutput({ input: opts.background || 'og-image.png', output: opts.output, extension: '.png', suffix: '-og' })

  const canvas = createCanvas(1200, 630)
  const ctx = canvas.getContext('2d')

  if (opts.background && existsSync(opts.background)) {
    const bg = await loadImage(opts.background)
    ctx.drawImage(bg, 0, 0, 1200, 630)
  } else {
    ctx.fillStyle = opts.theme === 'dark' ? '#111' : '#eee'
    ctx.fillRect(0, 0, 1200, 630)
    if (opts.background) {
        ctx.fillStyle = opts.background
        ctx.fillRect(0, 0, 1200, 630)
    }
  }

  ctx.fillStyle = opts.theme === 'dark' ? '#fff' : '#000'
  ctx.textAlign = 'center'
  
  ctx.font = 'bold 80px Inter, sans-serif'
  ctx.fillText(opts.title, 600, 315)
  
  if (opts.subtitle) {
    ctx.font = '40px Inter, sans-serif'
    ctx.fillText(opts.subtitle, 600, 380)
  }

  const buf = canvas.toBuffer('image/png')
  writeFileSync(finalPath, buf)

  console.log(`OG Image generated → ${finalPath}`)
  return { files: [finalPath] }
}
