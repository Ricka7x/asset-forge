import sharp from 'sharp'
import { createCanvas, loadImage } from '@napi-rs/canvas'
import { resolveOutput } from '../lib/output'
import { defineCommand } from 'citty'
import { writeFileSync } from 'fs'

export default defineCommand({
  meta: {
    name: 'compare',
    description: 'Create side-by-side comparison of two images',
  },
  args: {
    a:      { type: 'positional', description: 'First image',              required: true },
    b:      { type: 'positional', description: 'Second image',             required: true },
    output: { type: 'positional', description: 'Output PNG',      required: false },
    mode:   { type: 'positional', description: 'horizontal or vertical', default: 'horizontal' },
  },
  async run({ args }) {
    await compare(args.a, args.b, args.output, args.mode)
  }
})

export async function compare(a: string, b: string, output?: string | any, mode: string = 'horizontal') {
  const finalPath = resolveOutput({ input: a, output, extension: '.png' })
  
  const imgA = await loadImage(a)
  const imgB = await loadImage(b)
  
  let w, h
  if (mode === 'horizontal') {
    w = imgA.width + imgB.width
    h = Math.max(imgA.height, imgB.height)
  } else {
    w = Math.max(imgA.width, imgB.width)
    h = imgA.height + imgB.height
  }

  const canvas = createCanvas(w, h)
  const ctx = canvas.getContext('2d')
  
  ctx.drawImage(imgA, 0, 0)
  if (mode === 'horizontal') {
    ctx.drawImage(imgB, imgA.width, 0)
  } else {
    ctx.drawImage(imgB, 0, imgA.height)
  }

  writeFileSync(finalPath, await canvas.toBuffer('image/png'))
  console.log(`Saved comparison to ${finalPath}`)
  
  return { files: [finalPath] }
}
