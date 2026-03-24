import sharp from 'sharp'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'
import { getOutDir as getGlobalOutDir } from '../config'
import { defineCommand } from 'citty'

export default defineCommand({
  meta: {
    name: 'favicon',
    description: 'Generate favicon set + site.webmanifest (--ico-only for just the .ico)',
  },
  args: {
    logo:    { type: 'positional', description: 'Source logo image', required: true },
    output:  { type: 'positional', description: 'Output directory', required: false },
    icoOnly: { type: 'boolean',    description: 'Generate only a .ico file', alias: 'ico-only', default: false },
  },
  async run({ args }) {
    // Citty sometimes maps aliases to hyphenated keys instead of the target key
    const out = args.output
    const ico = args.icoOnly || args['ico-only']
    await favicon(args.logo, out, { icoOnly: ico })
  }
})

export async function favicon(logo: string, dest?: string | any, opts: any = {}) {
  const { checkTip } = await import('../config')
  checkTip()

  const baseDir = dest || getGlobalOutDir()
  
  let outDir: string
  if (opts.icoOnly) {
     outDir = baseDir
  } else {
     outDir = dest ? baseDir : join(baseDir, 'favicon')
  }

  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

  const results: string[] = []

  // favicon.ico
  const icoPath = join(outDir, 'favicon.ico')
  await sharp(logo).resize(32, 32).toFile(icoPath)
  results.push(icoPath)

  if (opts.icoOnly) {
    console.log(`Saved favicon to → ${icoPath}`)
    return { files: [icoPath] }
  }

  // Apple touch icon
  const appleTouchPath = join(outDir, 'apple-touch-icon.png')
  await sharp(logo).resize(180, 180).toFile(appleTouchPath)
  results.push(appleTouchPath)

  // Standard PNG sizes
  for (const size of [16, 32, 192, 512]) {
    const p = join(outDir, `favicon-${size}x${size}.png`)
    await sharp(logo).resize(size, size).toFile(p)
    results.push(p)
  }

  // site.webmanifest
  const manifest = {
    name: '',
    short_name: '',
    icons: [
      { src: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/favicon-512x512.png', sizes: '512x512', type: 'image/png' }
    ],
    theme_color: '#ffffff',
    background_color: '#ffffff',
    display: 'standalone'
  }
  const manifestPath = join(outDir, 'site.webmanifest')
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
  results.push(manifestPath)

  console.log(`Done → ${outDir}/`)
  const html = `
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
  `
  return { files: results, html }
}
