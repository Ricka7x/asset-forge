import ffmpeg from 'fluent-ffmpeg'
import ffmpegStatic from 'ffmpeg-static'
import { resolveOutput } from '../lib/output'
import { defineCommand } from 'citty'

if (ffmpegStatic) ffmpeg.setFfmpegPath(ffmpegStatic)

export default defineCommand({
  meta: {
    name: 'video-to-gif',
    description: 'Convert a video clip to high-quality GIF',
  },
  args: {
    video:  { type: 'positional', description: 'Source video',           required: true },
    output: { type: 'positional', description: 'Output GIF',             required: false },
    fps:    { type: 'positional', description: 'Frames per second',      default: '12' },
    width:  { type: 'positional', description: 'Max width (px)',         default: '480' },
  },
  async run({ args }) {
    await videoToGif(args.video, args.output, { fps: parseInt(args.fps), width: parseInt(args.width) })
  }
})

export async function videoToGif(video: string, output?: string | any, opts: any = {}) {
  const finalPath = resolveOutput({ input: video, output, extension: '.gif' })
  const fps = opts.fps || 12
  const width = opts.width || 480

  console.log(`Generating high-quality GIF (fps: ${fps}, width: ${width})...`)

  // Use the 2-pass palette approach for best GIF quality
  // pass 1
  return new Promise((resolve, reject) => {
    ffmpeg(video)
      .outputOptions([
        `-vf fps=${fps},scale=${width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`
      ])
      .save(finalPath)
      .on('end', () => {
        console.log(`Done → ${finalPath}`)
        resolve({ files: [finalPath] })
      })
      .on('error', reject)
  })
}
