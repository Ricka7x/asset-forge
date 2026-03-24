import { createCanvas } from '@napi-rs/canvas'
import { writeFileSync } from 'fs'
import { resolveOutput } from '../lib/output'
import { defineCommand } from 'citty'

export default defineCommand({
  meta: {
    name: 'palette',
    description: 'Extract dominant color palette',
  },
  args: {
    image:  { type: 'positional', description: 'Source image',           required: true },
    colors: { type: 'positional', description: 'Number of colors',       default: '6' },
    swatch: { type: 'positional', description: 'Save swatch PNG to this path', default: '' },
  },
  async run({ args }) {
    await palette(args.image, { count: parseInt(args.colors), swatchOutput: args.swatch })
  }
})

export async function palette(imagePath: string, opts: any = {}) {
  const { Vibrant } = (await import('node-vibrant/node')) as any
  const count = opts.count || 6
  const swatchOutput = opts.swatchOutput

  const paletteObj = await Vibrant.from(imagePath).getPalette()
  const swatches = Object.values(paletteObj).filter(s => s !== null)
  const hexCodes = swatches.slice(0, count).map((s: any) => s.hex)

  console.log(hexCodes.join('  '))

  if (swatchOutput) {
    const canvas = createCanvas(swatches.length * 100, 100)
    const ctx = canvas.getContext('2d')
    swatches.forEach((s: any, i) => {
      ctx.fillStyle = s.hex
      ctx.fillRect(i * 100, 0, 100, 100)
    })
    const finalPath = resolveOutput({ input: imagePath, output: swatchOutput })
    writeFileSync(finalPath, await canvas.toBuffer('image/png'))
    console.log(`Saved swatch to ${finalPath}`)
  }

  return { colors: hexCodes, swatch: swatchOutput }
}
