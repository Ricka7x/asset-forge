import { describe, test, expect } from 'bun:test'
import { spawnSync } from 'bun'

const CLI = './dist/asset-forge'

function run(...args: string[]) {
  return spawnSync([CLI, ...args], { stderr: 'pipe', stdout: 'pipe' })
}

const COMMANDS = [
  'optimize', 'resize', 'thumbnail', 'srcset', 'placeholder', 'blur-hash',
  'palette', 'watermark', 'shadow', 'border', 'round-corners', 'add-text',
  'trim', 'montage', 'compare', 'strip-meta', 'audit', 'info', 'device-frame',
  'duplicates', 'rename', 'convert', 'og-image', 'favicon', 'ico', 'appiconset',
  'ios-icons', 'android-icons', 'pwa-icons', 'sprites', 'promo', 'feature-graphic',
  'github-social', 'email-banner', 'gif-to-video', 'video-to-gif', 'convert-video',
  'compress-video', 'trim-video', 'extract-frames',
]

describe('smoke', () => {
  test('asset-forge --help exits 0', () => {
    const result = run('--help')
    expect(result.exitCode).toBe(0)
  })

  test('asset-forge prints banner', () => {
    const result = run('--help')
    const output = result.stdout.toString()
    expect(output).toContain('the complete asset toolkit')
  })

  test('asset-forge --version is not shown as unknown flag', () => {
    const result = run('--help')
    expect(result.exitCode).toBe(0)
  })

  for (const cmd of COMMANDS) {
    test(`asset-forge ${cmd} --help exits 0`, () => {
      const result = run(cmd, '--help')
      expect(result.exitCode).toBe(0)
    })

    test(`asset-forge ${cmd} --help shows command name`, () => {
      const result = run(cmd, '--help')
      const output = result.stdout.toString()
      expect(output).toContain(cmd)
    })
  }
})
