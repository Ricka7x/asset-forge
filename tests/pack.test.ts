import { describe, expect, test } from 'bun:test'
import { spawnSync } from 'child_process'

function getPackMetadata() {
  const result = spawnSync('npm', ['pack', '--dry-run', '--json'], {
    encoding: 'utf-8',
  })

  expect(result.status).toBe(0)

  const stdout = result.stdout || ''
  const jsonStart = stdout.indexOf('[')
  expect(jsonStart).toBeGreaterThanOrEqual(0)

  const payload = JSON.parse(stdout.slice(jsonStart))
  expect(Array.isArray(payload)).toBe(true)
  expect(payload.length).toBeGreaterThan(0)

  return payload[0] as {
    size: number
    unpackedSize: number
    files: Array<{ path: string }>
  }
}

describe('npm pack', () => {
  test('publishes only expected runtime files', () => {
    const pack = getPackMetadata()
    const paths = pack.files.map((file) => file.path)

    expect(paths).toContain('package.json')
    expect(paths).toContain('README.md')
    expect(paths).toContain('LICENSE')
    expect(paths).toContain('dist/cli.js')
    expect(paths).toContain('dist/index.js')
    expect(paths).toContain('assets/fonts/Inter-Bold.ttf')
    expect(paths).toContain('assets/fonts/Inter-Regular.ttf')

    for (const path of paths) {
      const allowed =
        path === 'package.json' ||
        path === 'README.md' ||
        path === 'LICENSE' ||
        path.startsWith('dist/') ||
        path.startsWith('assets/')

      expect(allowed).toBe(true)
    }
  })

  test('does not publish source, tests, or build byproducts', () => {
    const pack = getPackMetadata()
    const paths = pack.files.map((file) => file.path)

    expect(paths.some((path) => path.startsWith('src/'))).toBe(false)
    expect(paths.some((path) => path.startsWith('tests/'))).toBe(false)
    expect(paths.some((path) => path.startsWith('.github/'))).toBe(false)
    expect(paths.some((path) => path.startsWith('Formula/'))).toBe(false)
    expect(paths).not.toContain('build.ts')
    expect(paths).not.toContain('GUIDE.md')
    expect(paths).not.toContain('dist/asset-forge')
  })

  test('package size stays within expected bounds', () => {
    const pack = getPackMetadata()

    expect(pack.size).toBeLessThan(1_000_000)
    expect(pack.unpackedSize).toBeLessThan(2_000_000)
  })
})