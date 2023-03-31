import * as parse5 from 'parse5'
import { adapter } from 'parse5-htmlparser2-tree-adapter'

/**
 * @typedef {import("domhandler").Document} Document
 * @typedef {import("domhandler").Element} Element
 * @typedef {import("domhandler").Text} Text
 * @typedef { Element | Text } Node
*/


/** @param {string} html */
export function parseHtml(html) {
  return parse5.parse(html, { treeAdapter: adapter })
}


/** @param {string} html */
export function parseFragment(html, fragmentContext = createElement('div')) {
  return parse5.parseFragment(fragmentContext, html, { treeAdapter: adapter })
}


/** @param {Element | Document} node */
export function serialize(node) {
  return parse5.serialize(node, { treeAdapter: adapter })
}


/** @param {Element | Document} node */
export function serializeOuter(node) {
  return parse5.serializeOuter(node, { treeAdapter: adapter })
}


/** @type {(tagName: string, attributes?: {[name: string]: string}) => Element} */
export function createElement(tagName, attributes = {}) {
  const attrs = Object.keys(attributes).map(name => ({ name, value: attributes[name] }))
  return adapter.createElement(tagName, parse5.html.NS.HTML, attrs)
}


/** @type {(node: Element | Document, predicate: (node: Node) => boolean) => Node | undefined} */
export function qs(node, predicate) {
  let result
  if (node.type !== 'root' && predicate(node)) {
    result = node
  } else {
    for (let child of node.children) {
      if (adapter.isElementNode(child)) result = qs(child, predicate)
      if (child.type === 'text' && predicate(child)) result = child
      if (result) break
    }
  }
  return result
}


/** @type {(node: Element | Document, predicate: (node: Node) => boolean, res?: Node[]) => Node[]} */
export function qsa(node, predicate, res = []) {
  if (node.type !== 'root' && predicate(node)) res.push(node)
  for (let child of node.children) {
    if (adapter.isElementNode(child)) qsa(child, predicate, res)
    if (child.type === 'text' && predicate(child)) res.push(child)
  }
  return res
}


/** @type {(newChild: Node, refChild: Node) => void} */
export function insertBefore(newChild, refChild) {
  if (!newChild || !refChild) throw new Error('missing parameter')
  if (!refChild.parent) throw new Error('insertBefore Error: refChild has no parent element')
  adapter.insertBefore(refChild.parent, newChild, refChild)
}


/** @type {(parentNode: Element, newNode: Node) => void} */
export function appendChild(parentNode, newNode) {
  if (!parentNode || !newNode) throw new Error('missing parameter')
  adapter.appendChild(parentNode, newNode)
}


/** @type {(parentNode: Element, text: string) => void} */
export function insertText(parentNode, text) {
  if (!parentNode || text == null) throw new Error('missing parameter')
  return adapter.insertText(parentNode, text)
}


/** @param {Node} node */
export function detachNode(node) {
  if (!node) throw new Error('missing parameter')
  adapter.detachNode(node)
}




/**
 *   CUSTOM FUNCTIONS
 */



/** @type {(el: Element, html: string) => void} */
export function innerHTML(el, html) {
  if (!el || html == null) throw new Error('missing parameter')
  if (!(typeof html === 'string')) throw new TypeError('innerHTML: html param must be a string')
  el.children = []
  const fragment = parseFragment(html, el)
  for (const child of fragment.children) {
    if (adapter.isElementNode(child)) appendChild(el, child)
  }
}


/** @param {Element} el */
export function cloneElement(el) {
  const newEl = createElement(el.tagName)
  adapter.adoptAttributes(newEl, adapter.getAttrList(el))
  const children = adapter.getChildNodes(el)
  for (const child of children) {
    if (adapter.isElementNode(child)) {
      const newChild = cloneElement(child)
      appendChild(newEl, newChild)
    }
    if (adapter.isTextNode(child)) adapter.insertText(newEl, child.data)
  }
  return newEl
}


/** @param {Document} document */
export function documentBody(document) {
  return qs(document, el => el.type === 'tag' && el.name === 'body')
}
