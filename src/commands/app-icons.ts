import sharp from 'sharp'
import { join } from 'path'
import { getOutDir as getGlobalOutDir } from '../config'
import { defineCommand } from 'citty'
import { writeFileSync, existsSync, mkdirSync } from 'fs'

export interface AppIconsOptions {
  platform?: 'ios' | 'android' | 'macos'
}

export default defineCommand({
  meta: {
    name: 'app-icons',
    description: 'Generate multi-platform app icons',
  },
  args: {
    logo:      { type: 'positional', description: 'Source image (1024x1024)', required: true },
    output:    { type: 'positional', description: 'Output directory',         required: false },
    platform:  { type: 'string',     description: 'ios|android|macos',       default: 'macos' },
  },
  async run({ args }) {
    await appIcons(args.logo, args.output, { platform: args.platform as any })
  }
})

export async function appIcons(logo: string, dest?: string, opts: AppIconsOptions = {}) {
  const platform = opts.platform || 'macos'
  const baseDir = dest || getGlobalOutDir()
  const files: string[] = []

  if (platform === 'macos') {
    const iconset = dest && dest.endsWith('.appiconset') ? dest : join(baseDir, 'AppIcon.appiconset')
    if (!existsSync(iconset)) mkdirSync(iconset, { recursive: true })
    
    const sizes = [16, 32, 64, 128, 256, 512, 1024]
    for (const s of sizes) {
      const p = join(iconset, `icon_${s}x${s}.png`)
      
      const padding = Math.round(s * 0.1)
      const contentSize = s - (padding * 2)
      const r = Math.round(s * 0.2)
      
      const mask = Buffer.from(
        `<svg><rect x="0" y="0" width="${s}" height="${s}" rx="${r}" ry="${r}" /></svg>`
      )

      await sharp(logo)
        .resize(contentSize, contentSize)
        .extend({
          top: padding, bottom: padding, left: padding, right: padding,
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .composite([{ input: mask, blend: 'dest-in' }])
        .toFile(p)
      
      files.push(p)
    }
    
    const contentsJson = {
      images: sizes.map(s => ({
        size: `${s}x${s}`,
        idiom: 'mac',
        filename: `icon_${s}x${s}.png`,
        scale: '1x'
      })),
      info: { version: 1, author: 'xcode' }
    }
    writeFileSync(join(iconset, 'Contents.json'), JSON.stringify(contentsJson, null, 2))
    files.push(join(iconset, 'Contents.json'))
    
  } else if (platform === 'ios') {
    const iconset = dest && dest.endsWith('.appiconset') ? dest : join(baseDir, 'AppIcon-ios.appiconset')
    if (!existsSync(iconset)) mkdirSync(iconset, { recursive: true })
    
    const sizes = [20, 29, 40, 60, 76, 83.5, 1024]
    for (const s of sizes) {
      const p = join(iconset, `icon-${s}.png`)
      await sharp(logo).resize(Math.round(s), Math.round(s)).toFile(p)
      files.push(p)
    }
    
    const contentsJson = {
      images: sizes.map(s => ({
        size: `${s}x${s}`,
        idiom: 'iphone',
        filename: `icon-${s}.png`,
        scale: '1x'
      })),
      info: { version: 1, author: 'xcode' }
    }
    writeFileSync(join(iconset, 'Contents.json'), JSON.stringify(contentsJson, null, 2))
    files.push(join(iconset, 'Contents.json'))
    
  } else if (platform === 'android') {
    const res = baseDir
    const mipmaps = ['mipmap-mdpi', 'mipmap-hdpi', 'mipmap-xhdpi', 'mipmap-xxhdpi', 'mipmap-xxxhdpi']
    const scales = [48, 72, 96, 144, 192]
    
    for (let i = 0; i < mipmaps.length; i++) {
        const dir = join(res, mipmaps[i])
        if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
        const p = join(dir, 'ic_launcher.png')
        await sharp(logo).resize(scales[i], scales[i]).toFile(p)
        files.push(p)
        
        const pRound = join(dir, 'ic_launcher_round.png')
        const r = scales[i] / 2
        const mask = Buffer.from(`<svg><circle cx="${r}" cy="${r}" r="${r}" /></svg>`)
        await sharp(logo).resize(scales[i], scales[i]).composite([{ input: mask, blend: 'dest-in' }]).toFile(pRound)
        files.push(pRound)
    }
    const store = join(res, 'ic_launcher-playstore.png')
    await sharp(logo).resize(512, 512).toFile(store)
    files.push(store)
  }

  console.log(`Generated ${platform} icons in ${baseDir}`)
  return { files }
}
