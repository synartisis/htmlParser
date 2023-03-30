import * as parse5 from 'parse5'
import { adapter } from 'parse5-htmlparser2-tree-adapter'

/**
 * @typedef {import("domhandler").AnyNode} AnyNode
 * @typedef {import("domhandler").ParentNode} ParentNode
 * @typedef {import("domhandler").Node} Node
 * @typedef {import("domhandler").Element} Element
 */


/** @param {string} content */
export function parseHtml(content) {
  return parse5.parse(content, { treeAdapter: adapter })
}


/** @param {string} content */
export function parseFragment(content) {
  return parse5.parseFragment(content, { treeAdapter: adapter })
}


/** @param {Element} node */
export function serialize(node) {
  return parse5.serialize(node, { treeAdapter: adapter })
}


/** @type {(tagName: string, attributes: {[name: string]: string}) => Element} */
export function createElement(tagName, attributes = {}) {
  const attrs = Object.keys(attributes).map(name => ({ name, value: attributes[name], namespace: parse5.html.NS.HTML, prefix: '' }))
  return adapter.createElement(tagName, parse5.html.NS.HTML, attrs)
}


/** @param {Element} document */
export function documentBody(document) {
  return qs(document, el => el.name === 'body')
}


/** @type {(node: Element, predicate: (node: Element) => boolean) => Element | undefined} */
export function qs(node, predicate) {
  let result
  if (predicate(node)) {
    result = node
  } else {
    if (node.children) {
      for (let child of node.children) {
        if (adapter.isElementNode(child)) {
          result = qs(child, predicate)
          if (result) break
        }
      }
    }
  }
  return result
}


/** @type {(node: Element, predicate: (node: Element) => boolean, res?: Element[]) => Element[]} */
export function qsa(node, predicate, res = []) {
  if (predicate(node)) res.push(node)
  if (node.children) node.children.forEach(child => {
    if (adapter.isElementNode(child)) qsa(child, predicate, res)
  })
  return res
}


/** @type {(newChild: Element, refChild: Element) => void} */
export function insertBefore(newChild, refChild) {
  if (!newChild || !refChild) throw new Error('missing parameter')
  if (!refChild.parent) throw new Error('insertBefore Error: refChild has no parent element')
  adapter.insertBefore(refChild.parent, newChild, refChild)
}


/** @type {(parentNode: Element, newNode: Element) => void} */
export function appendChild(parentNode, newNode) {
  if (!parentNode || !newNode) throw new Error('missing parameter')
  adapter.appendChild(parentNode, newNode)
}


/** @type {(parentNode: Element, text: string) => void} */
export function insertText(parentNode, text) {
  if (!parentNode || text == null) throw new Error('missing parameter')
  return adapter.insertText(parentNode, text)
}


/** @param {Element} el */
export function remove(el) {
  if (!el) throw new Error('missing parameter')
  adapter.detachNode(el)
}



/** @type {(newChild: Element, refChild: Element) => void} */
// export function insertAfter(newChild, refChild) {
//   if (!newChild || !refChild) throw new Error('missing parameter')
//   if (!refChild.parent) throw new Error('insertAfter Error: refChild has no parent element')
//   adapter.insertBefore(refChild.parent, refChild, newChild)
// }



/**
 *   CUSTOM FUNCTIONS
 */


/** @type {(el: Element, html: string) => void} */
export function innerHTML(el, html) {
  if (!el || html == null) throw new Error('missing parameter')
  if (!(typeof html === 'string')) throw new TypeError('innerHTML: html param must be a string')
  el.children = []
  // const fragment = parseFragment(html)
  const fragment = parse5.parseFragment(el, html, { treeAdapter: adapter })
  if (fragment.children) {
    for (const child of fragment.children) {
      if (adapter.isElementNode(child)) appendChild(el, child)
    }
  }
}




/** @param {Element} el */
export function clone(el) {
  // must think what to do with non-element children
  throw new Error('not implemented')
  const newEl = createElement(el.tagName, { ...el.attribs })
  // adapter.adoptAttributes(newEl, adapter.getAttrList(el))
  const children = adapter.getChildNodes(el)
  if (children) {
    for (const child of children) {
      const newChild = clone(child)
      append(newEl, newChild)
    }
  }
  return newEl
}
