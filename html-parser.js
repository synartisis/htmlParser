import * as parse5 from 'parse5'
import * as htmlparser2Adapter from 'parse5-htmlparser2-tree-adapter'
import * as domhandler from 'domhandler'
export { domhandler }

/**
 * @typedef { 'tag' | 'root' | 'text' } NodeType
 */

const { adapter } = htmlparser2Adapter


/** @param {string} html */
export function parseHtml(html) {
  return parse5.parse(html, { treeAdapter: adapter })
}


/** 
 * @param {string} html 
 * @param {domhandler.ParentNode?} fragmentContext
 * */
export function parseFragment(html, fragmentContext = null) {
  return parse5.parseFragment(fragmentContext, html, { treeAdapter: adapter })
}


/** @param {domhandler.ParentNode} node */
export function serialize(node) {
  return parse5.serialize(node, { treeAdapter: adapter })
}


/** @param {domhandler.AnyNode} node */
export function serializeOuter(node) {
  return parse5.serializeOuter(node, { treeAdapter: adapter })
}


/** 
 * @param {string} tagName
 * @param {{[name: string]: string}} [attributes={}]
 * */
export function createElement(tagName, attributes = {}) {
  const attrs = Object.keys(attributes).map(name => ({ name, value: attributes[name] }))
  return adapter.createElement(tagName, parse5.html.NS.HTML, attrs)
}


/** @type {(newChild: domhandler.ChildNode, refChild: domhandler.ChildNode) => void} */
export function insertBefore(newChild, refChild) {
  if (!newChild || !refChild) throw new Error('missing parameter')
  if (!refChild.parent) throw new Error('insertBefore Error: refChild has no parent element')
  adapter.insertBefore(refChild.parent, newChild, refChild)
}


/** @type {(parentNode: domhandler.ParentNode, newNode: domhandler.ChildNode) => void} */
export function appendChild(parentNode, newNode) {
  if (!parentNode || !newNode) throw new Error('missing parameter')
  adapter.appendChild(parentNode, newNode)
}


/** @type {(parentNode: domhandler.ParentNode, text: string) => void} */
export function insertText(parentNode, text) {
  if (!parentNode || text == null) throw new Error('missing parameter')
  return adapter.insertText(parentNode, text)
}


/** @param {domhandler.ChildNode} node */
export function detachNode(node) {
  if (!node) throw new Error('missing parameter')
  adapter.detachNode(node)
}




/**
 *   CUSTOM FUNCTIONS
 */



/** 
 * searches for any node matching the predicate
 * @type {(node: domhandler.ParentNode, predicate: (node: domhandler.AnyNode) => boolean, type?: NodeType) => domhandler.AnyNode | undefined} 
 */
export function findOne(node, predicate, type) {
  let result
  if ((!type || node.type === type) && predicate(node)) {
    result = node
  } else {
    for (let child of node.children) {
      if (adapter.isElementNode(child)) result = findOne(child, predicate)
      if ((!type || node.type === type) && predicate(child)) result = child
      if (result) break
    }
  }
  return result
}


/** 
 * searches for any nodes matching the predicate
 * @type {(node: domhandler.ParentNode, predicate: (node: domhandler.AnyNode) => boolean, res?: domhandler.AnyNode[]) => domhandler.AnyNode[]} 
 * */
export function findAll(node, predicate, res = []) {
  if (predicate(node)) res.push(node)
  for (let child of node.children) {
    if (adapter.isElementNode(child)) {
      findAll(child, predicate, res)
    } else {
      if (predicate(child)) res.push(child)
    }
  }
  return res
}



/** 
 * searches for an Element matching the predicate
 * @type {(node: domhandler.ParentNode, predicate: (node: domhandler.Element) => boolean) => domhandler.Element | undefined}
 * */
export function qs(node, predicate) {
  let result
  if ((node.type === 'tag' || node.type === 'script') && predicate(node)) {
    result = node
  } else {
    for (let child of node.children) {
      if (child.type === 'tag' || child.type === 'script') result = qs(child, predicate)
      if (result) break
    }
  }
  return result
}


/** 
 * searches for any Elements matching the predicate
 * @type {(node: domhandler.ParentNode, predicate: (node: domhandler.Element) => boolean, res?: domhandler.Element[]) => domhandler.Element[]} 
 * */
export function qsa(node, predicate, res = []) {
  if ((node.type === 'tag' || node.type === 'script') && predicate(node)) res.push(node)
  for (let child of node.children) {
    if (child.type === 'tag' || child.type === 'script') qsa(child, predicate, res)
  }
  return res
}


/** @type {(el: domhandler.ParentNode, html: string) => void} */
export function innerHTML(el, html) {
  if (!el || html == null) throw new Error('missing parameter')
  if (!(typeof html === 'string')) throw new TypeError('innerHTML: html param must be a string')
  el.children = []
  const fragment = parseFragment(html, el)
  for (const child of fragment.children) {
    if (adapter.isElementNode(child)) appendChild(el, child)
  }
}


/** @param {domhandler.Element} el */
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


/** @type {(document: domhandler.Document) => domhandler.Element | undefined} */
export function documentBody(document) {
  return qs(document, el => el.name === 'body')
}
