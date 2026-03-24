import sharp from 'sharp'
import { resolveOutput } from '../lib/output'
import { defineCommand } from 'citty'

export default defineCommand({
  meta: {
    name: 'shadow',
    description: 'Add drop shadow to an image',
  },
  args: {
    input:   { type: 'positional', description: 'Source image',  required: true },
    output:  { type: 'positional', description: 'Output PNG', required: false },
    blur:    { type: 'positional', description: 'Blur radius',   default: '20' },
    opacity: { type: 'positional', description: 'Opacity 0-100', default: '80' },
    offsetX: { type: 'positional', description: 'X offset',      default: '10' },
    offsetY: { type: 'positional', description: 'Y offset',      default: '10' },
    color:   { type: 'positional', description: 'Shadow color',  default: 'black' },
  },
  async run({ args }) {
    await shadow(args.input, args.output, { 
      blur: parseInt(args.blur), 
      opacity: parseInt(args.opacity), 
      offsetX: parseInt(args.offsetX), 
      offsetY: parseInt(args.offsetY), 
      color: args.color 
    })
  }
})

export async function shadow(input: string, output?: string | any, opts: any = {}) {
  const blur = opts.blur ?? 20
  const opacity = (opts.opacity ?? 80) / 100
  const offsetX = opts.offsetX ?? 10
  const offsetY = opts.offsetY ?? 10
  const color = opts.color || 'black'
  const finalPath = resolveOutput({ input, output, extension: '.png' })

  const meta = await sharp(input).metadata()
  const w = meta.width!
  const h = meta.height!
  
  const padding = blur * 3
  const targetW = w + padding * 2
  const targetH = h + padding * 2

  // 1. Create blurred shadow mask
  const shadowMask = await sharp({
      create: { width: w, height: h, channels: 4, background: color }
  })
  .composite([{ input, blend: 'dest-in' }])
  .png()
  .toBuffer()
  .then(b => sharp(b).blur(blur).toBuffer())

  // 2. Compose on larger canvas
  await sharp({
    create: { width: targetW, height: targetH, channels: 4, background: { r:0, g:0, b:0, alpha:0 } }
  })
  .composite([
    { input: shadowMask, top: padding + offsetY, left: padding + offsetX, opacity } as any,
    { input, top: padding, left: padding }
  ])
  .toFile(finalPath)

  console.log(`Shadow added → ${finalPath}`)
  return { files: [finalPath] }
}
