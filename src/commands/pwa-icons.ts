import sharp from 'sharp'
import { join } from 'path'
import { getOutDir as getGlobalOutDir } from '../config'
import { defineCommand } from 'citty'
import { existsSync, mkdirSync } from 'fs'

export default defineCommand({
  meta: {
    name: 'pwa-icons',
    description: 'Generate standard PWA manifest icons',
  },
  args: {
    logo:   { type: 'positional', description: 'Source image (512x512 recommended)', required: true },
    output: { type: 'positional', description: 'Output directory', required: false },
  },
  async run({ args }) {
    await pwaIcons(args.logo, args.output)
  }
})

export async function pwaIcons(logo: string, dest?: string | any) {
  const outDir = dest || join(getGlobalOutDir(), 'pwa-icons')
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

  const sizes = [72, 96, 128, 144, 152, 192, 384, 512]
  const files = []

  console.log(`Generating PWA icons in ${outDir}...`)

  for (const size of sizes) {
    const p = join(outDir, `icon-${size}x${size}.png`)
    await sharp(logo).resize(size, size).toFile(p)
    files.push(p)
  }

  console.log(`Done → ${outDir}`)
  return { files }
}
