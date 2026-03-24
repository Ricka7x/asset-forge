import sharp from 'sharp'
import { createCanvas } from '@napi-rs/canvas'
import { resolveOutput } from '../lib/output'
import { defineCommand } from 'citty'

export default defineCommand({
  meta: {
    name: 'add-text',
    description: 'Add text overlay to an image',
  },
  args: {
    input:   { type: 'positional', description: 'Source image', required: true },
    text:    { type: 'positional', description: 'Text to add',   required: true },
    output:  { type: 'positional', description: 'Output image', required: false },
    gravity: { type: 'positional', description: 'Position',     default: 'South' },
    size:    { type: 'positional', description: 'Font size',   default: '48' },
    color:   { type: 'positional', description: 'Text color',   default: 'white' },
  },
  async run({ args }) {
    await addText(args.input, args.text, args.output, {
      gravity: args.gravity,
      size: parseInt(args.size),
      color: args.color
    })
  }
})

export async function addText(input: string, text: string, output?: string | any, opts: any = {}) {
  // Support overloaded args
  if (typeof output === 'object' && !Array.isArray(output)) {
    opts = output
    output = undefined
  }

  const finalPath = resolveOutput({ input, output })
  const meta = await sharp(input).metadata()
  const w = meta.width!
  const h = meta.height!

  const canvas = createCanvas(w, h)
  const ctx = canvas.getContext('2d')
  
  ctx.fillStyle = opts.color || 'white'
  ctx.font = `${opts.size || 48}px sans-serif`
  ctx.textAlign = 'center'
  
  // Simple gravity handling
  let x = w / 2, y = h / 2
  if (opts.gravity === 'South') y = h - (opts.size || 48)
  if (opts.gravity === 'North') y = (opts.size || 48)
  
  ctx.fillText(text, x, y)
  const overlay = await canvas.toBuffer('image/png')

  await sharp(input).composite([{ input: overlay }]).toFile(finalPath)
  
  console.log(`Done → ${finalPath}`)
  return { files: [finalPath] }
}
