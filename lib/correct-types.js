// type declarations are not resolved correctly in some cases. Run this to fix it.

import * as fs from 'node:fs/promises'

const __dirname = new URL('.', import.meta.url).pathname
const filename = __dirname + 'syn-html-parser.d.ts'

let content = await fs.readFile(filename, 'utf8')
if (content) {
  content = content.replaceAll(`import("../node_modules/parse5/dist/tree-adapters/default.js").Element`, `dom['element']`)
  content = content.replaceAll(`import("../node_modules/parse5/dist/tree-adapters/default.js").TextNode`, `dom['textNode']`)
  await fs.writeFile(filename, content)
}
