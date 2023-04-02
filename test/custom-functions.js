import assert from 'node:assert'
import * as html from '../html-parser.js'
import * as content from './html-content.js'


describe('test custom methods', () => {

  it('findOne', async () => {
    throw new Error('not implemented')
  })

  it('findAll', async () => {
    throw new Error('not implemented')
  })

  it('qs', async () => {
    throw new Error('not implemented')
  })

  it('qsa', async () => {
    throw new Error('not implemented')
  })

  it('innerHTML', async () => {
    const fragment = html.parseFragment(content.HTMLFragment)
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
    const fragment = html.parseFragment(content.HTMLFragment)
    const section = html.qs(fragment, o => o.type === 'tag' && o.name === 'section')
    if (!section || section.type !== 'tag') throw new assert.AssertionError({ message: 'error in fragment parsing' })
    const clonedSection = html.cloneElement(section)
    assertEqualHTML(html.serializeOuter(section), html.serializeOuter(clonedSection))
  })

  it('documentBody', async () => {
    const doc = html.parseHtml(content.HTMLDocument)
    const body = html.documentBody(doc)
    assert.notStrictEqual(body, undefined)
    assert.strictEqual(body?.type, 'tag')
    assert.strictEqual(body?.name, 'body')
  })

  it('documentHead', async () => {
    const doc = html.parseHtml(content.HTMLDocument)
    const head = html.documentBody(doc)
    assert.notStrictEqual(head, undefined)
    assert.strictEqual(head?.type, 'tag')
    assert.strictEqual(head?.name, 'head')
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