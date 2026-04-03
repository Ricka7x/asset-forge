import ffmpeg from '../lib/ffmpeg'
import { resolveOutput } from '../lib/output'
import { defineCommand } from 'citty'

export default defineCommand({
  meta: {
    name: 'convert-video',
    description: 'Convert video to a specific format',
  },
  args: {
    video:   { type: 'positional', description: 'Source video',           required: true },
    output:  { type: 'positional', description: 'Output video/extension', required: true },
    quality: { type: 'positional', description: 'CRF (0-51, default 23)', default: '23' },
  },
  async run({ args }) {
    await convertVideo(args.video, args.output, { quality: parseInt(args.quality) })
  }
})

export async function convertVideo(video: string, output: string, opts: any = {}) {
  const finalPath = resolveOutput({ input: video, output })
  const quality = opts.quality || 23

  console.log(`Converting video to ${finalPath} (CRF: ${quality})...`)

  return new Promise((resolve, reject) => {
    ffmpeg(video)
      .outputOptions(`-crf ${quality}`)
      .save(finalPath)
      .on('end', () => {
         console.log(`Done → ${finalPath}`)
         resolve({ files: [finalPath] })
      })
      .on('error', reject)
  })
}
