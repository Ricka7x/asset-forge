import { describe, test, expect } from 'bun:test'
import { spawnSync } from 'child_process'

const CLI = './dist/cli.js'

function run(...args: string[]) {
  // Use node to run the compiled CLI
  return spawnSync('node', [CLI, ...args], { encoding: 'utf-8' })
}

const COMMANDS = [
  'optimize', 'resize', 'upscale', 'thumbnail', 'srcset', 'placeholder', 'blur-hash',
  'palette', 'watermark', 'shadow', 'border', 'round-corners', 'add-text',
  'trim', 'montage', 'compare', 'strip-meta', 'audit', 'info',
  'device-frame', 'duplicates', 'rename', 'convert',
  'og-image', 'favicon', 'app-icons', 'pwa-icons', 'sprites',
  'promo', 'feature-graphic', 'github-social', 'email-banner',
  'gif-to-video', 'video-to-gif', 'convert-video', 'compress-video', 'trim-video', 'extract-frames',
  'config'
]

describe('smoke', () => {
  test('asset-forge --help exits 0', () => {
    const result = run('--help')
    expect(result.status).toBe(0)
  })

  test('asset-forge prints banner', () => {
    const result = run() // No args to trigger banner
    expect(result.stdout).toContain('the complete asset toolkit')
  })

  test('asset-forge --version works', () => {
    const result = run('--version')
    expect(result.status).toBe(0)
  })

  for (const cmd of COMMANDS) {
    test(`asset-forge ${cmd} --help exits 0`, () => {
      const result = run(cmd, '--help')
      expect(result.status).toBe(0)
    })

    test(`asset-forge ${cmd} --help shows command name or description`, () => {
      const result = run(cmd, '--help')
      if (cmd === 'config') {
          expect(result.stdout).toContain('config')
      } else {
          expect(result.stdout.toLowerCase()).toContain(cmd.toLowerCase())
      }
    })
  }
})
