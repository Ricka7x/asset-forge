import ffmpeg from 'fluent-ffmpeg'
import ffmpegStatic from 'ffmpeg-static'
import { join } from 'path'
import { defineCommand } from 'citty'
import { existsSync, mkdirSync } from 'fs'

if (ffmpegStatic) ffmpeg.setFfmpegPath(ffmpegStatic)

export default defineCommand({
  meta: {
    name: 'gif-to-video',
    description: 'Convert animated GIF to MP4 + WebM',
  },
  args: {
    gif:    { type: 'positional', description: 'Source GIF',         required: true },
    output: { type: 'positional', description: 'Output directory',  required: false },
  },
  async run({ args }) {
    await gifToVideo(args.gif, args.output)
  }
})

export async function gifToVideo(gifPath: string, dest?: string | any) {
  const outDir = dest || 'video'
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

  const mp4Path = join(outDir, 'animation.mp4')
  const webmPath = join(outDir, 'animation.webm')

  console.log(`Converting ${gifPath} to video formats...`)

  await Promise.all([
    new Promise((resolve, reject) => {
      ffmpeg(gifPath)
        .outputOptions('-pix_fmt yuv420p')
        .outputOptions('-vf scale=trunc(iw/2)*2:trunc(ih/2)*2')
        .save(mp4Path)
        .on('end', resolve)
        .on('error', reject)
    }),
    new Promise((resolve, reject) => {
      ffmpeg(gifPath)
        .save(webmPath)
        .on('end', resolve)
        .on('error', reject)
    })
  ])

  console.log(`Generated: ${mp4Path}, ${webmPath}`)
  console.log('\nHTML snippet:\n' + 
    `<video autoplay loop muted playsinline poster="${gifPath}">\n` + 
    `  <source src="/${webmPath}" type="video/webm">\n` + 
    `  <source src="/${mp4Path}" type="video/mp4">\n` + 
    `</video>`)

  return { files: [mp4Path, webmPath] }
}
