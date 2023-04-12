import * as html from '../lib/syn-html-parser.js'
import * as content from './html-content.js'

const args = process.argv.splice(2)

const doc = html.parseHtml(content.HTMLDocument)

if (args.includes('--distinct')) {
  const nodeNames = new Set
  html.findAll(doc, el => {
    if (!nodeNames.has(el.nodeName)) {
      nodeNames.add(el.nodeName)
      // @ts-ignore
      console.log(el.nodeName, '[' + Object.keys(el).join(',') + ']', 'attrs:', el.attrs)
    }
    return false
  })
} else {
  html.findAll(doc, el => {
    const padding = parentCount(el)
    console.log(padding ? '  '.repeat(padding) : '', el.nodeName, '[' + Object.keys(el).join(',') + ']')
    return false
  })
}


/** @param {html.Node} el */
function parentCount(el) {
  let count = -1
  let cur = el
  do {
    count++
    // @ts-ignore
    cur = cur.parentNode
  } while (cur)
  return count
}