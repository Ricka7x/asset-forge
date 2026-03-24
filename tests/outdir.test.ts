import { describe, test, expect, beforeAll, afterAll } from 'bun:test'
import { spawnSync } from 'child_process'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs'
import { join, resolve } from 'path'

const CLI      = resolve('./dist/cli.js')
const LOGO_ABS = resolve('./tests/fixtures/logo.png')
const TMP      = resolve('./tests/tmp-outdir')

function run(envOverrides: Record<string, string | undefined>, ...args: string[]) {
  const env: Record<string, string> = {}
  for (const [k, v] of Object.entries({ ...process.env, FORGE_OUT: undefined, ...envOverrides })) {
    if (v !== undefined) env[k] = v
  }
  return spawnSync('node', [CLI, ...args], { 
      encoding: 'utf-8',
      env 
  })
}

beforeAll(() => {
    if (existsSync(TMP)) rmSync(TMP, { recursive: true, force: true })
    mkdirSync(TMP, { recursive: true })
})
afterAll(() => rmSync(TMP, { recursive: true, force: true }))

describe('output directory fallback', () => {
  describe('FORGE_OUT', () => {
    test('favicon creates favicon/ subfolder when no output arg given', () => {
      const out = join(TMP, 'forge-out')
      mkdirSync(out, { recursive: true })
      const result = run({ FORGE_OUT: out }, 'favicon', LOGO_ABS)
      expect(result.status).toBe(0)
      expect(existsSync(join(out, 'favicon', 'favicon.ico'))).toBe(true)
    })

    test('favicon --ico-only outputs a single file with no subfolder', () => {
      const out = join(TMP, 'forge-out-ico')
      mkdirSync(out, { recursive: true })
      const result = run({ FORGE_OUT: out }, 'favicon', LOGO_ABS, '--ico-only')
      expect(result.status).toBe(0)
      expect(existsSync(join(out, 'favicon.ico'))).toBe(true)
      expect(existsSync(join(out, 'favicon'))).toBe(false)
    })

    test('app-icons uses FORGE_OUT when no output arg given', () => {
      const out = join(TMP, 'forge-out-icons')
      mkdirSync(out, { recursive: true })
      const result = run({ FORGE_OUT: out }, 'app-icons', LOGO_ABS)
      expect(result.status).toBe(0)
      expect(existsSync(join(out, 'AppIcon.appiconset', 'Contents.json'))).toBe(true)
    })

    test('pwa-icons uses FORGE_OUT when no output arg given', () => {
      const out = join(TMP, 'forge-out-pwa')
      mkdirSync(out, { recursive: true })
      const result = run({ FORGE_OUT: out }, 'pwa-icons', LOGO_ABS)
      expect(result.status).toBe(0)
      expect(existsSync(join(out, 'pwa-icons', 'icon-192x192.png'))).toBe(true)
    })
  })

  describe('config outDir', () => {
    test('favicon uses config outDir when no output arg given', () => {
      const fakeHome = join(TMP, 'home-with-config')
      const configuredOut = join(TMP, 'configured-out')
      mkdirSync(configuredOut, { recursive: true })
      mkdirSync(join(fakeHome, '.config', 'asset-forge'), { recursive: true })
      writeFileSync(
        join(fakeHome, '.config', 'asset-forge', 'config.json'),
        JSON.stringify({ outDir: configuredOut })
      )
      const result = run({ HOME: fakeHome }, 'favicon', LOGO_ABS)
      expect(result.status).toBe(0)
      expect(existsSync(join(configuredOut, 'favicon', 'favicon.ico'))).toBe(true)
    })
  })

  describe('setup tip', () => {
    test('tip shown when no outDir configured and no output arg', () => {
      const fakeHome = join(TMP, 'home-no-config')
      const out = join(TMP, 'tip-output')
      mkdirSync(fakeHome, { recursive: true })
      // pass explicit output dir so files don't land in project root,
      // but tip still fires because neither FORGE_OUT nor config outDir is set
      const result = run({ HOME: fakeHome }, 'favicon', LOGO_ABS, out)
      expect(result.status).toBe(0)
      const stdout = result.stdout
      expect(stdout).toContain('Tip:')
      expect(stdout).toContain('forge config set outDir')
    })

    test('tip NOT shown when FORGE_OUT is set', () => {
      const out = join(TMP, 'forge-out-tip-check')
      const fakeHome = join(TMP, 'home-no-config-2')
      mkdirSync(out, { recursive: true })
      mkdirSync(fakeHome, { recursive: true })
      const result = run({ FORGE_OUT: out, HOME: fakeHome }, 'favicon', LOGO_ABS)
      expect(result.status).toBe(0)
      expect(result.stdout).not.toContain('Tip:')
    })

    test('tip NOT shown when config outDir is set', () => {
      const fakeHome = join(TMP, 'home-with-config-tip')
      const configuredOut = join(TMP, 'configured-out-tip')
      mkdirSync(configuredOut, { recursive: true })
      mkdirSync(join(fakeHome, '.config', 'asset-forge'), { recursive: true })
      writeFileSync(
        join(fakeHome, '.config', 'asset-forge', 'config.json'),
        JSON.stringify({ outDir: configuredOut })
      )
      const result = run({ HOME: fakeHome }, 'favicon', LOGO_ABS)
      expect(result.status).toBe(0)
      expect(result.stdout).not.toContain('Tip:')
    })
  })
})
