import { defineCommand } from 'citty'
import { writeFileSync } from 'fs'
import { composeMarketingAsset } from '../lib/canvas'
import { resolveOutput } from '../lib/output'

export default defineCommand({
  meta: {
    name: 'feature-graphic',
    description: 'Google Play Store feature graphic (1024x500)',
  },
  args: {
    background: { type: 'string',     alias: 'b', description: 'Background image', required: true },
    title:      { type: 'string',     alias: 't', description: 'Headline text',    required: true },
    logo:       { type: 'string',     alias: 'l', description: 'Logo image' },
    subtitle:   { type: 'string',     alias: 's', description: 'Subtitle text' },
    output:     { type: 'string',     alias: 'o', description: 'Output PNG' },
    theme:      { type: 'string',     alias: 'm', description: 'light|dark', default: 'dark' },
  },
  async run({ args }) {
    await featureGraphic(args)
  }
})

export async function featureGraphic(args: any) {
    const finalPath = resolveOutput({ 
       input: args.background, 
       output: args.output, 
       extension: '.png', 
       suffix: '-feature' 
    })

    const buf = await composeMarketingAsset({
      width: 1024, height: 500,
      background: args.background,
      logo: args.logo,
      headline: args.title,
      subtitle: args.subtitle,
      theme: args.theme as any,
      overlayColor: args.theme === 'dark' ? 'rgba(0,0,0,0.45)' : undefined,
      logoPx: 140, logoY: 70,
      headlineY: 200, subtitleY: 300,
      headlinePt: 72,  subtitlePt: 36
    })

    writeFileSync(finalPath, buf)
    console.log(`Feature Graphic generated → ${finalPath}`)
    return { files: [finalPath] }
}
