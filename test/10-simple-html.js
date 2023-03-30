import fs from 'node:fs/promises'
import assert from 'node:assert'
import * as html from '../html-parser.js'
const __dirname = new URL('.', import.meta.url).pathname

const contentFragment = /*html*/`
  <section>
    <div id="child1">child1 content</div>
    <div id="child2">child2 content</div>
  </section>
`


describe('custom methods', () => {

  it('insertAfter', async () => {
    assert.fail('not implemented')
  })

  it('innerHTML', async () => {
    const fragment = html.parseFragment(contentFragment)
    const child1 = html.qs(fragment, o => o.attribs?.id === 'child1')
    html.innerHTML(child1, /*html*/`<span id="grandchild">grandchild content</span>`)
    console.log(html.serialize(fragment))
    assert.equal(trimLines(html.serialize(fragment)), trimLines(/*html*/`
      <section>
        <div id="child1"><span id="grandchild">grandchild content</span></div>
        <div id="child2">child2 content</div>
      </section>
    `))
  })

})



function trimLines(content) {
  return content.split('\n').map(l => l.trim()).join('')
}