import * as dom from '../node_modules/parse5/dist/tree-adapters/default.js'
import assert from 'node:assert'
import * as html from '../lib/syn-html-parser.js'
import * as content from './html-content.js'


describe('test custom methods', () => {

  it('findOne', async () => {
    const dom = getDOM()
    const textNode = html.findOne(dom.doc, node => html.adapter.isTextNode(node) && node.value.includes('text'))
    if (!textNode) assert.fail('text node not found')
    if (!html.adapter.isTextNode(textNode)) assert.fail('should be a text node')
    assert.strictEqual(textNode.value.trim(), 'text node')
  })

  it('findAll', async () => {
    const dom = getDOM()
    const nodes = html.findAll(dom.doc, node => 
      (html.adapter.isTextNode(node) && node.value.includes('text')) || 
      (html.adapter.isElementNode(node) && node.tagName === 'article'))
    assert.strictEqual(Array.isArray(nodes), true, 'returns an Array')
    assert.strictEqual(nodes.length, 2)
  })

  it('qs', async () => {
    const dom = getDOM()
    const div = html.qs(dom.doc, el => el.tagName === 'div')
    assert.notStrictEqual(div, undefined, 'selects tags')
    const script = html.qs(dom.doc, el => el.tagName === 'script')
    assert.notStrictEqual(script, undefined, 'selects script elements')
    const style = html.qs(dom.doc, el => el.tagName === 'style')
    assert.notStrictEqual(style, undefined, 'selects style elements')
  })

  it('qsa', async () => {
    const dom = getDOM()
    const els = html.qsa(dom.doc, el => el.tagName === 'section')
    assert.strictEqual(Array.isArray(els), true, 'returns an Array')
    assert.strictEqual(els.length, 1)
    const scriptOrStyles = html.qsa(dom.doc, el => el.tagName === 'script' || el.tagName === 'style')
    assert.strictEqual(scriptOrStyles.length, 2)
  })

  it('innerHTML', async () => {
    const fragment = html.parseFragment(content.HTMLFragment)
    const child1 = html.qs(fragment, o => html.adapter.isElementNode(o) && o.attrs.find(a => a.name === 'id')?.value === 'child1')
    if (!child1 || !html.adapter.isElementNode(child1)) throw assert.fail('error in fragment parsing')
    html.innerHTML(child1, /*html*/`<span id="grandchild">grandchild content</span>`)
    assertEqualHTML(
      html.serialize(fragment), 
      /*html*/`
      <section attr1="attr1 value">
        <div id="child1"><span id="grandchild">grandchild content</span></div>
        <div id="child2">child2 content</div>
      </section>
    `)
  })

  it('cloneElement', async () => {
    const fragment = html.parseFragment(content.HTMLFragment)
    const section = html.qs(fragment, o => o.tagName === 'section')
    if (!section) assert.fail('error in fragment parsing')
    const clonedSection = html.cloneElement(section)
    assertEqualHTML(html.serializeOuter(section), html.serializeOuter(clonedSection))
  })

  it('documentBody', async () => {
    const dom = getDOM()
    const body = html.documentBody(dom.doc)
    if (!body) assert.fail('body element not found')
    if (!html.adapter.isElementNode(body)) assert.fail('body element has wrong type')
    assert.strictEqual(body.tagName, 'body')
  })

  it('documentHead', async () => {
    const dom = getDOM()
    const head = html.documentHead(dom.doc)
    assert.notStrictEqual(head, undefined)
    if (!head) assert.fail('head element not found')
    if (!html.adapter.isElementNode(head)) assert.fail('head element has wrong type')
    assert.strictEqual(head.tagName, 'head')
  })

  it('insertAdjacentHTML - returns an element map', async () => {
    const dom = getDOM()
    const elementMap1 = html.insertAdjacentHTML(dom.div2, 'beforebegin', content.HTMLFragmentChildren)
    assert.notStrictEqual(elementMap1, undefined)
    assert.strictEqual(Object.keys(elementMap1).length, 2)
    assert.notStrictEqual(elementMap1['child1'], undefined)
    assert.notStrictEqual(elementMap1['child2'], undefined)
    const elementMap2 = html.insertAdjacentHTML(dom.div2, 'beforebegin', content.HTMLFragment)
    assert.strictEqual(Object.keys(elementMap2).length, 0)
    assert.strictEqual(elementMap2['child1'], undefined)
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
    assert.throws(() => { html.createElementFromHTML(doubleFragment) })
    assert.throws(() => { html.createElementFromHTML(textContent) })
    assert.strictEqual(html.adapter.isElementNode(correctElm) && correctElm.tagName === 'section', true)
  })

  it('getAttributes', async () => {
    const { doc, main } = getDOM()
    const el = html.qs(doc, el => el.attrs.find(o => o.name === 'id')?.value === 'attribute tester')
    if (!el) assert.fail('element with id "attribute tester" not found')
    const attributes = html.getAttributes(el)
    const mainAttributes = html.getAttributes(main)
    assert.strictEqual(JSON.stringify(attributes), JSON.stringify({
      id: 'attribute tester',
      attr1: 'attr1 value',
      attr2: 'attr2 value',
    }))
    assert.strictEqual(JSON.stringify(mainAttributes), JSON.stringify({}))
  })

  it('insertAfter', async () => {
    const { doc } = getDOM()
    const insertAfter = html.qs(doc, el => el.attrs.find(o => o.name === 'id')?.value === 'insert-after')
    const insertAfter1 = html.qs(doc, el => el.attrs.find(o => o.name === 'id')?.value === 'insert-after1')
    const insertAfter2 = html.qs(doc, el => el.attrs.find(o => o.name === 'id')?.value === 'insert-after2')
    if (!insertAfter || !insertAfter1 || !insertAfter2) assert.fail('an element is not found')
    const insertAfterNew = html.createElementFromHTML(/*html*/`<div id="insert-after-new"></div>`, insertAfter)
    html.insertAfter(insertAfterNew, insertAfter2)
    assertEqualHTML(html.serialize(insertAfter), /*html*/`
      <div id="insert-after1"></div>
      <div id="insert-after2"></div>
      <div id="insert-after-new"></div>
    `)
    html.insertAfter(insertAfterNew, insertAfter1)
    assertEqualHTML(html.serialize(insertAfter), /*html*/`
      <div id="insert-after1"></div>
      <div id="insert-after-new"></div>
      <div id="insert-after2"></div>
      <div id="insert-after-new"></div>
    `)
    if (insertAfterNew.parentNode !== insertAfter1.parentNode) assert.fail('parent node not set')
  })

  it('removeAttribute', async () => {
    const { doc } = getDOM()
    const el = html.qs(doc, el => el.attrs.find(o => o.name === 'id')?.value === 'attribute tester')
    if (!el) assert.fail('element with id "attribute tester" not found')
    html.removeAttribute(el, 'unknown attr')
    assertEqualHTML(html.serializeOuter(el), /*html*/`
      <div id="attribute tester" attr1="attr1 value" attr2="attr2 value"></div>
    `, 'remove unknown attribute')
    html.removeAttribute(el, 'attr1')
    assertEqualHTML(html.serializeOuter(el), /*html*/`
      <div id="attribute tester" attr2="attr2 value"></div>
    `)
  })

  it('setAttribute', async () => {
    const { doc } = getDOM()
    const el = html.qs(doc, el => el.attrs.find(o => o.name === 'id')?.value === 'attribute tester')
    if (!el) assert.fail('element with id "attribute tester" not found')
    html.setAttribute(el, 'attr1', 'attr1 new value')
    html.setAttribute(el, 'attr3', 'attr3 value')
    assertEqualHTML(html.serializeOuter(el), /*html*/`
      <div id="attribute tester" attr1="attr1 new value" attr2="attr2 value" attr3="attr3 value"></div>
    `)
  })

})



/** @param {string} content */
function trimLines(content) {
  return content.split('\n').map(l => l.trim()).join('')
}

/** @type {(html1: string, html2: string, message?: string | Error | undefined) => void} */
function assertEqualHTML(html1, html2, message) {
  assert.strictEqual(trimLines(html1), trimLines(html2), message)
}

/** @returns {{ doc: html.Document, main: dom.Element, div2: dom.Element }} */
function getDOM() {
  const doc = html.parseHtml(content.HTMLDocument)
  const main = html.qs(doc, o => o.tagName === 'main')
  if (!main) assert.fail('main element not found')
  const div2 = html.qs(doc, o => o.attrs.find(a => a.name === 'id')?.value === 'div2')
  if (!div2) assert.fail('div#div2 not found')
  return { doc, main, div2 }
}