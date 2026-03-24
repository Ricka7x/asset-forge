import { defineCommand } from 'citty'
import chalk from 'chalk'
import { getConfig, setConfig, getOutDir as _getOutDir } from '../config'

export const configCmd = defineCommand({
  meta: { name: 'config', description: 'Manage forge configuration' },
  subCommands: {
    set: defineCommand({
      meta: { name: 'set', description: 'Set a config value' },
      args: {
        key:   { type: 'positional', description: 'Config key (e.g. outDir)', required: true },
        value: { type: 'positional', description: 'Value to set',             required: true },
      },
      run({ args }) {
        const valid = ['outDir', 'fontBold', 'fontRegular']
        if (!valid.includes(String(args.key))) {
          console.error(chalk.red(`Unknown config key: ${args.key}`))
          console.error(chalk.dim(`  Available keys: ${valid.join(', ')}`))
          process.exit(1)
        }
        setConfig(args.key as 'outDir' | 'fontBold' | 'fontRegular', String(args.value))
        console.log(chalk.green(`✓ ${args.key} → ${args.value}`))
      },
    }),
    get: defineCommand({
      meta: { name: 'get', description: 'Get a config value (or show all)' },
      args: {
        key: { type: 'positional', description: 'Config key (optional — omit to show all)', default: '' },
      },
      run({ args }) {
        const cfg = getConfig()
        if (args.key) {
          const val = cfg[args.key as keyof typeof cfg]
          console.log(val ?? chalk.dim('(not set)'))
        } else {
          const outDir = _getOutDir()
          const outSource = process.env.FORGE_OUT
            ? chalk.dim('(from FORGE_OUT)')
            : cfg.outDir
            ? chalk.dim('(from config)')
            : chalk.dim('(default: cwd)')
          console.log(`outDir       ${chalk.cyan(outDir)}  ${outSource}`)

          const fontBold = process.env.FORGE_FONT_BOLD ?? cfg.fontBold
          const fontRegular = process.env.FORGE_FONT_REGULAR ?? cfg.fontRegular
          const fontSource = (env: string | undefined, cfg: string | undefined) =>
            env ? chalk.dim('(from env)') : cfg ? chalk.dim('(from config)') : chalk.dim('(auto-detect)')
          console.log(`fontBold     ${chalk.cyan(fontBold ?? 'auto')}  ${fontSource(process.env.FORGE_FONT_BOLD, cfg.fontBold)}`)
          console.log(`fontRegular  ${chalk.cyan(fontRegular ?? 'auto')}  ${fontSource(process.env.FORGE_FONT_REGULAR, cfg.fontRegular)}`)
        }
      },
    }),
    reset: defineCommand({
      meta: { name: 'reset', description: 'Reset all config to defaults' },
      run() {
        setConfig('outDir', '')
        console.log(chalk.green('✓ Config reset to defaults'))
      },
    }),
  },
})
