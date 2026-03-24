import { globFiles, IMAGE_EXTENSIONS } from '../lib/glob'
import { defineCommand } from 'citty'

export default defineCommand({
  meta: {
    name: 'duplicates',
    description: 'Find visually duplicate images',
  },
  args: {
    dir:       { type: 'positional', description: 'Directory to scan',                     required: true },
    threshold: { type: 'positional', description: 'Hamming distance 0-64 (0 = exact)',     default: '6' },
  },
  async run({ args }) {
    await duplicates(args.dir, parseInt(args.threshold))
  }
})

export async function duplicates(dir: string, threshold: number = 6) {
  const files = globFiles(dir, IMAGE_EXTENSIONS)
  const hashes: Record<string, string[]> = {}

  for (const file of files) {
    const hash = await computeHash(file)
    hashes[hash] = hashes[hash] || []
    hashes[hash].push(file)
  }

  const results = Object.values(hashes).filter(group => group.length > 1)
  
  if (results.length === 0) {
    console.log('No duplicates found.')
  } else {
    for (const group of results) {
      console.log(`Duplicate group: ${group.join(', ')}`)
    }
  }

  return { groups: results.map(files => ({ files })) }
}

async function computeHash(file: string): Promise<string> {
  const { imageHash } = (await import('image-hash')) as any
  return new Promise((resolve, reject) => {
    imageHash(file, 16, true, (error: any, data: any) => {
      if (error) reject(error)
      else resolve(data)
    })
  })
}
