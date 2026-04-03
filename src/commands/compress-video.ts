import ffmpeg from '../lib/ffmpeg'
import { resolveOutput } from '../lib/output'
import { defineCommand } from 'citty'

export default defineCommand({
  meta: {
    name: 'compress-video',
    description: 'Compress video for smaller file size',
  },
  args: {
    video:    { type: 'positional', description: 'Source video',           required: true },
    output:   { type: 'positional', description: 'Output video',           required: false },
    targetMB: { type: 'positional', description: 'Target size in MB',      default: '' },
  },
  async run({ args }) {
    await compressVideo(args.video, args.output, args.targetMB ? parseFloat(args.targetMB) : undefined)
  }
})

export async function compressVideo(video: string, output?: string | any, targetMB?: number) {
  const finalPath = resolveOutput({ input: video, output })
  
  if (targetMB) {
    console.log(`Attempting to compress video to ~${targetMB} MB... (Not implemented in this simple CLI)`)
    // Two-pass bitrate calculation would go here.
    // Fallback to high-quality CRF 28 for now
  }

  console.log(`Compressing video with CRF 28...`)

  return new Promise((resolve, reject) => {
    ffmpeg(video)
      .outputOptions('-crf 28')
      .outputOptions('-vf scale=-2:720') // Max 720p height
      .save(finalPath)
      .on('end', () => {
        console.log(`Done → ${finalPath}`)
        resolve({ files: [finalPath] })
      })
      .on('error', reject)
  })
}
