import { describe, test, expect, beforeAll, afterAll } from 'bun:test'
import { spawnSync } from 'bun'
import { existsSync, mkdirSync, rmSync } from 'fs'
import { join } from 'path'

const CLI     = './dist/asset-forge'
const LOGO    = './tests/fixtures/logo.png'   // 512x512
const PHOTO   = './tests/fixtures/photo.png'  // 1200x630
const OUT_DIR = './tests/out'

function run(...args: string[]) {
  return spawnSync([CLI, ...args], { stderr: 'pipe', stdout: 'pipe', env: { ...process.env, FORGE_OUT: OUT_DIR } })
}

function imageSize(file: string): { width: number; height: number } {
  const result = spawnSync(['magick', 'identify', '-format', '%wx%h', file], { stdout: 'pipe' })
  const [w, h] = result.stdout.toString().split('x').map(Number)
  return { width: w, height: h }
}

beforeAll(() => mkdirSync(OUT_DIR, { recursive: true }))
afterAll(() => rmSync(OUT_DIR, { recursive: true, force: true }))

describe('integration', () => {
  describe('resize', () => {
    test('resizes to specified width', () => {
      run('resize', LOGO, '256', OUT_DIR)
      const file = join(OUT_DIR, 'logo.png')
      expect(existsSync(file)).toBe(true)
      expect(imageSize(file).width).toBe(256)
    })
  })

  describe('og-image', () => {
    test('produces a 1200x630 image', () => {
      const out = join(OUT_DIR, 'og.png')
      const result = run('og-image', '-b', PHOTO, '-o', out)
      expect(result.exitCode).toBe(0)
      expect(existsSync(out)).toBe(true)
      const size = imageSize(out)
      expect(size.width).toBe(1200)
      expect(size.height).toBe(630)
    })

    test('accepts gravity flag', () => {
      const out = join(OUT_DIR, 'og-north.png')
      const result = run('og-image', '-b', PHOTO, '-g', 'North', '-o', out)
      expect(result.exitCode).toBe(0)
      expect(existsSync(out)).toBe(true)
      const size = imageSize(out)
      expect(size.width).toBe(1200)
      expect(size.height).toBe(630)
    })
  })

  describe('favicon', () => {
    test('generates expected output files', () => {
      const out = join(OUT_DIR, 'favicon')
      const result = run('favicon', LOGO, out)
      expect(result.exitCode).toBe(0)
      for (const file of [
        'favicon.ico',
        'favicon-16x16.png',
        'favicon-32x32.png',
        'apple-touch-icon.png',
        'site.webmanifest',
      ]) {
        expect(existsSync(join(out, file))).toBe(true)
      }
    })
  })

  describe('app-icons', () => {
    test('macos generates Contents.json and icon sizes', () => {
      const out = join(OUT_DIR, 'AppIcon.appiconset')
      const result = run('app-icons', LOGO, out)
      expect(result.exitCode).toBe(0)
      expect(existsSync(join(out, 'Contents.json'))).toBe(true)
      expect(existsSync(join(out, 'icon_512x512.png'))).toBe(true)
    })

    test('ios generates Contents.json and icon sizes', () => {
      const out = join(OUT_DIR, 'AppIcon-ios.appiconset')
      const result = run('app-icons', LOGO, out, '--platform', 'ios')
      expect(result.exitCode).toBe(0)
      expect(existsSync(join(out, 'Contents.json'))).toBe(true)
      expect(existsSync(join(out, 'icon-1024.png'))).toBe(true)
    })

    test('android generates mipmap folders', () => {
      const out = join(OUT_DIR, 'android-res')
      const result = run('app-icons', LOGO, out, '--platform', 'android')
      expect(result.exitCode).toBe(0)
      expect(existsSync(join(out, 'mipmap-xxxhdpi', 'ic_launcher.png'))).toBe(true)
      expect(existsSync(join(out, 'ic_launcher-playstore.png'))).toBe(true)
    })
  })

  describe('thumbnail', () => {
    test('produces correctly sized thumbnails', () => {
      const src = './tests/fixtures'
      const dest = join(OUT_DIR, 'thumbs')
      const result = run('thumbnail', src, dest, '200x200')
      expect(result.exitCode).toBe(0)
      const thumb = join(dest, 'logo.png')
      expect(existsSync(thumb)).toBe(true)
      const size = imageSize(thumb)
      expect(size.width).toBe(200)
      expect(size.height).toBe(200)
    })
  })

  describe('shadow', () => {
    test('produces a PNG output', () => {
      const out = join(OUT_DIR, 'shadow.png')
      const result = run('shadow', LOGO, out)
      expect(result.exitCode).toBe(0)
      expect(existsSync(out)).toBe(true)
    })
  })

  describe('round-corners', () => {
    test('produces a PNG output', () => {
      const out = join(OUT_DIR, 'rounded.png')
      const result = run('round-corners', LOGO, out)
      expect(result.exitCode).toBe(0)
      expect(existsSync(out)).toBe(true)
    })
  })

  describe('palette', () => {
    test('prints hex color codes to stdout', () => {
      const result = run('palette', LOGO, '3')
      expect(result.exitCode).toBe(0)
      const output = result.stdout.toString()
      expect(output).toMatch(/#[0-9a-fA-F]{6}/)
    })
  })
})
