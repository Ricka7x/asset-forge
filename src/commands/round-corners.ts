import sharp from 'sharp'
import { createCanvas } from '@napi-rs/canvas'
import { resolveOutput } from '../lib/output'
import { defineCommand } from 'citty'

export interface RoundCornersOptions {
  radius?: string | number
}

export default defineCommand({
  meta: {
    name: 'round-corners',
    description: 'Apply rounded corners to an image',
  },
  args: {
    input:  { type: 'positional', description: 'Source image',         required: true },
    output: { type: 'positional', description: 'Output PNG', required: false },
    radius: { type: 'positional', description: 'Radius in px or %',   default: '10%' },
  },
  async run({ args }) {
    await roundCorners(args.input, args.output, { radius: args.radius })
  }
})

export async function roundCorners(input: string, output?: string | RoundCornersOptions, opts: RoundCornersOptions = {}) {
  if (typeof output === 'object' && !Array.isArray(output)) {
    opts = output
    output = undefined
  }

  const radiusSpec = String(opts.radius || '10%')
  const finalPath = resolveOutput({ input, output: output as string, extension: '.png' })

  const meta = await sharp(input).metadata()
  const w = meta.width!
  const h = meta.height!
  
  let radius: number
  if (radiusSpec.endsWith('%')) {
    radius = Math.round(Math.min(w, h) * (parseFloat(radiusSpec) / 100))
  } else {
    radius = parseInt(radiusSpec)
  }

  const canvas = createCanvas(w, h)
  const ctx = canvas.getContext('2d') as any // Canvas types can be picky
  ctx.fillStyle = 'white'
  ctx.roundRect(0, 0, w, h, radius)
  ctx.fill()
  const mask = await (canvas as any).toBuffer('image/png')

  await sharp(input)
    .composite([{ input: mask, blend: 'dest-in' }])
    .toFile(finalPath)

  console.log(`Done → ${finalPath}`)
  return { files: [finalPath] }
}
