import { Resvg } from '@resvg/resvg-js'
import { readFileSync, writeFileSync } from 'fs'

const svg = readFileSync('./public/icon.svg', 'utf8')

for (const size of [192, 512]) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: size },
    font: { loadSystemFonts: false },
  })
  const rendered = resvg.render()
  const png = rendered.asPng()
  writeFileSync(`./public/icon-${size}.png`, png)
  console.log(`✓ icon-${size}.png generated (${png.length} bytes)`)
}

// Also generate apple-touch-icon (180x180)
const resvg180 = new Resvg(svg, { fitTo: { mode: 'width', value: 180 }, font: { loadSystemFonts: false } })
const rendered180 = resvg180.render()
writeFileSync('./public/apple-touch-icon.png', rendered180.asPng())
console.log('✓ apple-touch-icon.png generated')
