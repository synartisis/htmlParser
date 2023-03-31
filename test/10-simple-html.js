import assert from 'node:assert'
import * as html from '../html-parser.js'


const contentHTML = /*html*/`
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
  </head>
  <body>
    <div>
      simple document
    </div>
  </body>
  </html>
`

const contentFragment = /*html*/`
  <section>
    <div id="child1">child1 content</div>
    <div id="child2">child2 content</div>
  </section>
`


describe('test custom methods', () => {

  it('innerHTML', async () => {
    const fragment = html.parseFragment(contentFragment)
    const child1 = html.qs(fragment, o => o.type === 'tag' && o.attribs.id === 'child1')
    if (!child1 || child1.type !== 'tag') throw new assert.AssertionError({ message: 'error in fragment parsing' })
    html.innerHTML(child1, /*html*/`<span id="grandchild">grandchild content</span>`)
    assertEqualHTML(
      html.serialize(fragment), 
      /*html*/`
      <section>
        <div id="child1"><span id="grandchild">grandchild content</span></div>
        <div id="child2">child2 content</div>
      </section>
    `)
  })

  it('cloneElement', async () => {
    const fragment = html.parseFragment(contentFragment)
    const section = html.qs(fragment, o => o.type === 'tag' && o.name === 'section')
    if (!section || section.type !== 'tag') throw new assert.AssertionError({ message: 'error in fragment parsing' })
    const clonedSection = html.cloneElement(section)
    assertEqualHTML(html.serializeOuter(section), html.serializeOuter(clonedSection))
  })

  it('documentBody', async () => {
    const doc = html.parseHtml(contentHTML)
    const body = html.documentBody(doc)
    assert.notStrictEqual(body, undefined)
    assert.strictEqual(body?.type, 'tag')
    assert.strictEqual(body?.name, 'body')
  })

})



/** @param {string} content */
function trimLines(content) {
  return content.split('\n').map(l => l.trim()).join('')
}

/** @type {(html1: string, html2: string) => void} */
function assertEqualHTML(html1, html2) {
  assert.strictEqual(trimLines(html1), trimLines(html2))
}