import sharp from 'sharp'
import { encode } from 'blurhash'
import { defineCommand } from 'citty'

export default defineCommand({
  meta: {
    name: 'blur-hash',
    description: 'Compute BlurHash string for an image',
  },
  args: {
    image: { type: 'positional', description: 'Source image', required: true },
    x: { type: 'string', description: 'X components', default: '4' },
    y: { type: 'string', description: 'Y components', default: '3' },
  },
  async run({ args }) {
    await blurHash(args.image, parseInt(args.x), parseInt(args.y))
  }
})

export async function blurHash(imagePath: string, x: number = 4, y: number = 3) {
  const { data, info } = await sharp(imagePath)
    .ensureAlpha()
    .resize(32, 32, { fit: 'inside' })
    .raw()
    .toBuffer({ resolveWithObject: true })

  const hash = encode(new Uint8ClampedArray(data), info.width, info.height, x, y)
  console.log(hash)
  return hash
}
