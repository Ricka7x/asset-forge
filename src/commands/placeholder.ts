import sharp from 'sharp'
import { resolveOutput } from '../lib/output'
import { defineCommand } from 'citty'

export default defineCommand({
  meta: {
    name: 'placeholder',
    description: 'Generate LQIP base64 placeholder',
  },
  args: {
    image:  { type: 'positional', description: 'Source image', required: true },
    output: { type: 'positional', description: 'Output PNG path (optional, also prints data URI)', required: false },
  },
  async run({ args }) {
    await placeholder(args.image, args.output)
  }
})

export async function placeholder(image: string, output?: string) {
  const buffer = await sharp(image)
    .resize(20, 20, { fit: 'inside' })
    .blur(2)
    .toBuffer()

  const base64 = buffer.toString('base64')
  const dataUri = `data:image/png;base64,${base64}`
  
  console.log(dataUri)
  
  if (output) {
    const finalPath = resolveOutput({ input: image, output })
    await sharp(buffer).toFile(finalPath)
    console.log(`Saved tiny PNG to ${finalPath}`)
  }

  return { dataUri, files: output ? [output] : [] }
}
