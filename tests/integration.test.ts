import { describe, test, expect, beforeAll, afterAll } from 'bun:test'
import { spawnSync } from 'child_process'
import { existsSync, mkdirSync, rmSync } from 'fs'
import { join } from 'path'
import sharp from 'sharp'

const CLI     = './dist/cli.js'
const LOGO    = './tests/fixtures/logo.png'   // 512x512
const PHOTO   = './tests/fixtures/photo.png'  // 1200x630
const OUT_DIR = './tests/out'

function run(...args: string[]) {
  return spawnSync('node', [CLI, ...args], { 
    encoding: 'utf-8', 
    env: { ...process.env, FORGE_OUT: OUT_DIR } 
  })
}

async function imageSize(file: string): Promise<{ width: number; height: number }> {
  const meta = await sharp(file).metadata()
  return { width: meta.width!, height: meta.height! }
}

beforeAll(() => {
    if (existsSync(OUT_DIR)) rmSync(OUT_DIR, { recursive: true, force: true })
    mkdirSync(OUT_DIR, { recursive: true })
})
afterAll(() => rmSync(OUT_DIR, { recursive: true, force: true }))

describe('integration', () => {
  describe('resize', () => {
    test('resizes to specified width', async () => {
      run('resize', LOGO, '256', OUT_DIR)
      const file = join(OUT_DIR, 'logo.png')
      expect(existsSync(file)).toBe(true)
      const size = await imageSize(file)
      expect(size.width).toBe(256)
    })
  })

  describe('upscale', () => {
    test('2x doubles the dimensions', async () => {
      run('upscale', LOGO, '2', OUT_DIR)
      const file = join(OUT_DIR, 'logo@2x.png')
      expect(existsSync(file)).toBe(true)
      const size = await imageSize(file)
      expect(size.width).toBe(1024)
      expect(size.height).toBe(1024)
    })

    test('3x triples the dimensions', async () => {
      run('upscale', LOGO, '3', OUT_DIR)
      const file = join(OUT_DIR, 'logo@3x.png')
      expect(existsSync(file)).toBe(true)
      const size = await imageSize(file)
      expect(size.width).toBe(1536)
      expect(size.height).toBe(1536)
    })

    test('accepts Nx notation (e.g. 4x)', async () => {
      run('upscale', LOGO, '4x', OUT_DIR)
      const file = join(OUT_DIR, 'logo@4x.png')
      expect(existsSync(file)).toBe(true)
      const size = await imageSize(file)
      expect(size.width).toBe(2048)
    })

    test('exits non-zero on invalid scale', () => {
      const result = run('upscale', LOGO, '99x', OUT_DIR)
      expect(result.status).not.toBe(0)
    })
  })

  describe('og-image', () => {
    test('produces a 1200x630 image', async () => {
      const out = join(OUT_DIR, 'og.png')
      run('og-image', '-b', PHOTO, '-o', out)
      expect(existsSync(out)).toBe(true)
      const size = await imageSize(out)
      expect(size.width).toBe(1200)
    })
    test('works with title only', () => {
       const out = join(OUT_DIR, 'og-title.png')
       const result = run('og-image', 'Hello World', '-o', out)
       expect(result.status).toBe(0)
       expect(existsSync(out)).toBe(true)
    })
  })

  describe('favicon', () => {
    test('generates expected output files', () => {
      const out = join(OUT_DIR, 'favicon-suite')
      run('favicon', LOGO, out)
      expect(existsSync(join(out, 'favicon.ico'))).toBe(true)
      expect(existsSync(join(out, 'apple-touch-icon.png'))).toBe(true)
    })
  })

  describe('app-icons', () => {
    test('macos iconset', () => {
      const out = join(OUT_DIR, 'MacIcons.appiconset')
      run('app-icons', LOGO, out, '--platform', 'macos')
      expect(existsSync(join(out, 'Contents.json'))).toBe(true)
    })
    test('ios iconset', () => {
      const out = join(OUT_DIR, 'IosIcons.appiconset')
      run('app-icons', LOGO, out, '--platform', 'ios')
      expect(existsSync(join(out, 'Contents.json'))).toBe(true)
    })
    test('android mipmaps', () => {
      const out = join(OUT_DIR, 'android-icons')
      run('app-icons', LOGO, out, '--platform', 'android')
      expect(existsSync(join(out, 'mipmap-xxxhdpi', 'ic_launcher.png'))).toBe(true)
    })
  })

  describe('pwa-icons', () => {
    test('generates standard manifest icons', () => {
       const out = join(OUT_DIR, 'pwa')
       run('pwa-icons', LOGO, out)
       expect(existsSync(join(out, 'icon-512x512.png'))).toBe(true)
       expect(existsSync(join(out, 'icon-192x192.png'))).toBe(true)
    })
  })

  describe('thumbnail', () => {
    test('produces correctly sized thumbnails', async () => {
      const out = join(OUT_DIR, 'thumb.png')
      run('thumbnail', PHOTO, out, '200x100')
      const size = await imageSize(out)
      expect(size.width).toBe(200)
    })
  })

  describe('shadow', () => {
    test('applies shadow and returns 0', () => {
       const out = join(OUT_DIR, 'logo-shadow.png')
       const result = run('shadow', LOGO, out)
       expect(result.status).toBe(0)
       expect(existsSync(out)).toBe(true)
    })
  })

  describe('round-corners', () => {
    test('applies rounding and returns 0', () => {
       const out = join(OUT_DIR, 'logo-round.png')
       const result = run('round-corners', LOGO, out)
       expect(result.status).toBe(0)
       expect(existsSync(out)).toBe(true)
    })
  })

  describe('palette', () => {
    test('outputs hex codes', () => {
       const result = run('palette', LOGO, '5')
       expect(result.stdout).toMatch(/#[0-9a-fA-F]{6}/)
    })
    test('works with custom count', () => {
        const result = run('palette', LOGO, '10')
        expect(result.status).toBe(0)
    })
  })

  describe('convert', () => {
    test('to webp', () => {
       const out = join(OUT_DIR, 'logo.webp')
       run('convert', LOGO, out)
       expect(existsSync(out)).toBe(true)
    })
    test('to avif', () => {
        const out = join(OUT_DIR, 'logo.avif')
        run('convert', LOGO, out)
        expect(existsSync(out)).toBe(true)
    })
  })

  describe('duplicates', () => {
    test('runs without error', () => {
        const result = run('duplicates', './tests/fixtures')
        expect(result.status).toBe(0)
    })
  })
})
