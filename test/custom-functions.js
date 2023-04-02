import assert from 'node:assert'
import * as html from '../html-parser.js'
import * as content from './html-content.js'


describe('test custom methods', () => {

  let doc = html.parseHtml(content.HTMLDocument)
  const fragment = html.parseFragment(content.HTMLFragment)
  const main = html.qs(doc, o => o.name === 'main')
  if (!main) assert.fail('main not found')
  const div2 = html.qs(doc, o => o.attribs.id === 'div2')
  if (!div2) assert.fail('div#div2 not found')


  it('findOne', async () => {
    const textNode = html.findOne(doc, node => node.type === 'text' && node.data.includes('text'))
    assert.notStrictEqual(textNode, undefined)
    if (textNode?.type !== 'text') assert.fail('wrong node type')
    assert.strictEqual(textNode.data.trim(), 'text node')
  })

  it('findAll', async () => {
    const nodes = html.findAll(doc, node => (node.type === 'text' && node.data.includes('text')) || (node.type === 'tag' && node.name === 'article'))
    assert.strictEqual(Array.isArray(nodes), true, 'returns an Array')
    assert.strictEqual(nodes.length, 2)
  })

  it('qs', async () => {
    const div = html.qs(doc, el => el.name === 'div')
    assert.notStrictEqual(div, undefined, 'selects tags')
    const script = html.qs(doc, el => el.type === 'script')
    assert.notStrictEqual(script, undefined, 'selects script elements')
    const style = html.qs(doc, el => el.type === 'style')
    assert.notStrictEqual(style, undefined, 'selects style elements')
  })

  it('qsa', async () => {
    const els = html.qsa(doc, el => el.type === 'tag' && el.name === 'section')
    assert.strictEqual(Array.isArray(els), true, 'returns an Array')
    assert.strictEqual(els.length, 1)
    const scriptOrStyles = html.qsa(doc, el => el.type === 'script' || el.type === 'style')
    assert.strictEqual(scriptOrStyles.length, 2)
  })


  it('innerHTML', async () => {
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
    const section = html.qs(fragment, o => o.type === 'tag' && o.name === 'section')
    if (!section || section.type !== 'tag') throw new assert.AssertionError({ message: 'error in fragment parsing' })
    const clonedSection = html.cloneElement(section)
    assertEqualHTML(html.serializeOuter(section), html.serializeOuter(clonedSection))
  })

  it('documentBody', async () => {
    const body = html.documentBody(doc)
    assert.notStrictEqual(body, undefined)
    assert.strictEqual(body?.type, 'tag')
    assert.strictEqual(body?.name, 'body')
  })

  it('documentHead', async () => {
    const head = html.documentHead(doc)
    assert.notStrictEqual(head, undefined)
    assert.strictEqual(head?.type, 'tag')
    assert.strictEqual(head?.name, 'head')
  })

  it('insertAdjacentHTML - beforebegin', async () => {
    const content = /*html*/`
      <div id="child1">child1 content</div>
      <div id="child2"><span id="grandchild">grandchild content</span></div>
    `
    html.insertAdjacentHTML(div2, 'beforebegin', content)
    assertEqualHTML(
      html.serializeOuter(main),
      /*html*/`
        <main>
          ${content}
          <div id="div2"></div>
        </main>
      `
    )
  })

  // ****** cannot test because doc is changed 

  // it('insertAdjacentHTML - beforeend', async () => {
  //   const content = /*html*/`
  //     <div id="child1">child1 content</div>
  //     <div id="child2"><span id="grandchild">grandchild content</span></div>
  //   `
  //   html.insertAdjacentHTML(div2, 'beforeend', content)
  //   assertEqualHTML(
  //     html.serializeOuter(main),
  //     /*html*/`
  //       <main>
  //         <div id="div2">
  //           ${content}
  //         </div>
  //       </main>
  //     `
  //   )
  // })

})



/** @param {string} content */
function trimLines(content) {
  return content.split('\n').map(l => l.trim()).join('')
}

/** @type {(html1: string, html2: string) => void} */
function assertEqualHTML(html1, html2) {
  assert.strictEqual(trimLines(html1), trimLines(html2))
}