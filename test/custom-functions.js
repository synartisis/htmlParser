import assert from 'node:assert'
import * as html from '../html-parser.js'
import * as content from './html-content.js'


describe('test custom methods', () => {

  it('findOne', async () => {
    const dom = getDOM()
    const textNode = html.findOne(dom.doc, node => node.type === 'text' && node.data.includes('text'))
    assert.notStrictEqual(textNode, undefined)
    if (textNode?.type !== 'text') assert.fail('wrong node type')
    assert.strictEqual(textNode.data.trim(), 'text node')
  })

  it('findAll', async () => {
    const dom = getDOM()
    const nodes = html.findAll(dom.doc, node => (node.type === 'text' && node.data.includes('text')) || (node.type === 'tag' && node.name === 'article'))
    assert.strictEqual(Array.isArray(nodes), true, 'returns an Array')
    assert.strictEqual(nodes.length, 2)
  })

  it('qs', async () => {
    const dom = getDOM()
    const div = html.qs(dom.doc, el => el.name === 'div')
    assert.notStrictEqual(div, undefined, 'selects tags')
    const script = html.qs(dom.doc, el => el.type === 'script')
    assert.notStrictEqual(script, undefined, 'selects script elements')
    const style = html.qs(dom.doc, el => el.type === 'style')
    assert.notStrictEqual(style, undefined, 'selects style elements')
  })

  it('qsa', async () => {
    const dom = getDOM()
    const els = html.qsa(dom.doc, el => el.type === 'tag' && el.name === 'section')
    assert.strictEqual(Array.isArray(els), true, 'returns an Array')
    assert.strictEqual(els.length, 1)
    const scriptOrStyles = html.qsa(dom.doc, el => el.type === 'script' || el.type === 'style')
    assert.strictEqual(scriptOrStyles.length, 2)
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
    const dom = getDOM()
    const body = html.documentBody(dom.doc)
    assert.notStrictEqual(body, undefined)
    assert.strictEqual(body?.type, 'tag')
    assert.strictEqual(body?.name, 'body')
  })

  it('documentHead', async () => {
    const dom = getDOM()
    const head = html.documentHead(dom.doc)
    assert.notStrictEqual(head, undefined)
    assert.strictEqual(head?.type, 'tag')
    assert.strictEqual(head?.name, 'head')
  })

  it('insertAdjacentHTML - beforebegin', async () => {
    const dom = getDOM()
    html.insertAdjacentHTML(dom.div2, 'beforebegin', content.HTMLFragment)
    assertEqualHTML(
      html.serializeOuter(dom.main),
      /*html*/`
        <main>
          ${content.HTMLFragment}
          <div id="div2">
            <div id="div2a"></div>
          </div>
        </main>
      `
    )
  })

  it('insertAdjacentHTML - afterbegin', async () => {
    const dom = getDOM()
    html.insertAdjacentHTML(dom.div2, 'afterbegin', content.HTMLFragment)
    assertEqualHTML(
      html.serializeOuter(dom.main),
      /*html*/`
        <main>
          <div id="div2">
            ${content.HTMLFragment}
            <div id="div2a"></div>
          </div>
        </main>
      `
    )
  })

  it('insertAdjacentHTML - beforeend', async () => {
    const dom = getDOM()
    html.insertAdjacentHTML(dom.div2, 'beforeend', content.HTMLFragment)
    assertEqualHTML(
      html.serializeOuter(dom.main),
      /*html*/`
        <main>
          <div id="div2">
            <div id="div2a"></div>
            ${content.HTMLFragment}
          </div>
        </main>
      `
    )
  })

  it('insertAdjacentHTML - afterend', async () => {
    const dom = getDOM()
    html.insertAdjacentHTML(dom.div2, 'afterend', content.HTMLFragment)
    assertEqualHTML(
      html.serializeOuter(dom.main),
      /*html*/`
        <main>
          <div id="div2">
            <div id="div2a"></div>
          </div>
          ${content.HTMLFragment}
        </main>
      `
    )
  })

  it('createElementFromHTML', async () => {
    const doubleFragment = content.HTMLFragment + content.HTMLFragment
    const textContent = 'text only'
    const correctElm = html.createElementFromHTML(content.HTMLFragment)
    assert.notStrictEqual(correctElm, undefined)
    assert.throws(() => { const errorElm = html.createElementFromHTML(doubleFragment) })
    assert.throws(() => { const errorElm = html.createElementFromHTML(textContent) })
    assert.strictEqual(correctElm.type === 'tag' && correctElm.name === 'section', true)
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

/** @returns {{ doc: html.domhandler.Document, main: html.domhandler.Element, div2: html.domhandler.Element }} */
function getDOM() {
  const doc = html.parseHtml(content.HTMLDocument)
  const main = html.qs(doc, o => o.name === 'main')
  if (!main) assert.fail('main element not found')
  const div2 = html.qs(doc, o => o.attribs.id === 'div2')
  if (!div2) assert.fail('div#div2 not found')
  return { doc, main, div2 }
}