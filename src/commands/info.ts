import sharp from 'sharp'
import chalk from 'chalk'
import { defineCommand } from 'citty'

export default defineCommand({
  meta: {
    name: 'info',
    description: 'Show metadata and dimensions',
  },
  args: {
    images: { type: 'positional', description: 'One or more image files', required: true },
  },
  async run({ args }) {
    await info(args.images)
  }
})

export async function info(images: string | string[]) {
  const files = Array.isArray(images) ? images : [images]
  const results: any[] = []

  for (const file of files) {
    try {
      const meta = await sharp(file).metadata()
      console.log(`${chalk.bold(file)}:`)
      console.log(`  Format:    ${meta.format}`)
      console.log(`  Size:      ${meta.width}x${meta.height}`)
      console.log(`  Channels:  ${meta.channels}`)
      console.log(`  Space:     ${meta.space}`)
      console.log(`  Density:   ${meta.density || 'unknown'}`)
      
      const stats = await sharp(file).stats()
      console.log(`  Min/Max:   ${stats.channels[0].min}/${stats.channels[0].max}`)

      results.push({
        file,
        format: meta.format,
        width: meta.width,
        height: meta.height,
        channels: meta.channels,
        space: meta.space,
      })
    } catch (e) {
      console.error(`Error reading ${file}:`, e)
    }
  }

  return results
}
