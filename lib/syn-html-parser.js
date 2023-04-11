import * as parse5 from 'parse5'
import * as dom from '../node_modules/parse5/dist/tree-adapters/default.js'

export const adapter = parse5.defaultTreeAdapter


/** @param {string} html */
export function parseHtml(html) {
  return parse5.parse(html)
}


/** 
 * @param {string} html 
 * @param {dom.ParentNode?} fragmentContext
 * */
export function parseFragment(html, fragmentContext = null) {
  return parse5.parseFragment(fragmentContext, html, {})
}


/** @param {dom.ParentNode} node */
export function serialize(node) {
  return parse5.serialize(node)
}


/** @param {dom.Node} node */
export function serializeOuter(node) {
  return parse5.serializeOuter(node)
}


/** 
 * @param {string} tagName
 * @param {{[name: string]: string}} [attributes={}]
 * */
export function createElement(tagName, attributes = {}) {
  const attrs = Object.entries(attributes).map(([name, value]) => ({ name, value }))
  return adapter.createElement(tagName, parse5.html.NS.HTML, attrs)
}


/** @type {(newChild: dom.ChildNode, refChild: dom.ChildNode) => void} */
export function insertBefore(newChild, refChild) {
  if (!newChild || !refChild) throw new Error('missing parameter')
  if (!refChild.parentNode) throw new Error('insertBefore Error: refChild has no parent element')
  adapter.insertBefore(refChild.parentNode, newChild, refChild)
}


/** @type {(refNode: dom.ChildNode, text: string) => void} */
export function insertTextBefore(refNode, text) {
  if (!refNode || text == null) throw new Error('missing parameter')
  if (!refNode.parentNode) throw new Error('insertBefore Error: refNode has no parent element')
  adapter.insertTextBefore(refNode.parentNode, text, refNode)
}


/** @type {(parentNode: dom.ParentNode, newNode: dom.ChildNode) => void} */
export function appendChild(parentNode, newNode) {
  if (!parentNode || !newNode) throw new Error('missing parameter')
  adapter.appendChild(parentNode, newNode)
}


/** @type {(parentNode: dom.ParentNode, text: string) => void} */
export function insertText(parentNode, text) {
  if (!parentNode || text == null) throw new Error('missing parameter')
  return adapter.insertText(parentNode, text)
}


/** @param {dom.ChildNode} node */
export function detachNode(node) {
  if (!node) throw new Error('missing parameter')
  adapter.detachNode(node)
}




/**
 *   CUSTOM FUNCTIONS
 */



/** 
 * searches for any node matching the predicate
 * @type {(node: dom.ParentNode, predicate: (node: dom.Node) => boolean) => dom.Node | undefined} 
 */
export function findOne(node, predicate) {
  let result
  if (predicate(node)) {
    result = node
  } else {
    for (let child of node.childNodes) {
      if (parse5.defaultTreeAdapter.isElementNode(child)) result = findOne(child, predicate)
      if (predicate(child)) result = child
      if (result) break
    }
  }
  return result
}


/** 
 * searches for any nodes matching the predicate
 * @type {(node: dom.ParentNode, predicate: (node: dom.Node) => boolean, res?: dom.Node[]) => dom.Node[]} 
 * */
export function findAll(node, predicate, res = []) {
  if (predicate(node)) res.push(node)
  for (let child of node.childNodes) {
    if (parse5.defaultTreeAdapter.isElementNode(child)) {
      findAll(child, predicate, res)
    } else {
      if (predicate(child)) res.push(child)
    }
  }
  return res
}



/** 
 * searches for an Element matching the predicate
 * @type {(node: dom.ParentNode, predicate: (node: dom.Element) => boolean) => dom.Element | undefined}
 * */
export function qs(node, predicate) {
  let result
  if (adapter.isElementNode(node) && predicate(node)) {
    result = node
  } else {
    for (let child of node.childNodes) {
      if (adapter.isElementNode(child)) result = qs(child, predicate)
      if (result) break
    }
  }
  return result
}


/** 
 * searches for any Elements matching the predicate
 * @type {(node: dom.ParentNode, predicate: (node: dom.Element) => boolean, res?: dom.Element[]) => dom.Element[]} 
 * */
export function qsa(node, predicate, res = []) {
  if (adapter.isElementNode(node) && predicate(node)) res.push(node)
  for (let child of node.childNodes) {
    if (adapter.isElementNode(child)) qsa(child, predicate, res)
  }
  return res
}


/** @type {(el: dom.ParentNode, html: string) => void} */
export function innerHTML(el, html) {
  if (!el || html == null) throw new Error('missing parameter')
  if (!(typeof html === 'string')) throw new TypeError('innerHTML: html param must be a string')
  el.childNodes = []
  const fragment = parseFragment(html, el)
  for (const child of fragment.childNodes) {
    appendChild(el, child)
  }
}


/** @param {dom.Element} el */
export function cloneElement(el) {
  const newEl = createElement(el.tagName)
  parse5.defaultTreeAdapter.adoptAttributes(newEl, parse5.defaultTreeAdapter.getAttrList(el))
  const children = parse5.defaultTreeAdapter.getChildNodes(el)
  for (const child of children) {
    if (parse5.defaultTreeAdapter.isElementNode(child)) {
      const newChild = cloneElement(child)
      appendChild(newEl, newChild)
    }
    if (parse5.defaultTreeAdapter.isTextNode(child)) parse5.defaultTreeAdapter.insertText(newEl, child.value)
  }
  return newEl
}


/** @type {(document: dom.Document) => dom.Element | undefined} */
export function documentBody(document) {
  return qs(document, el => el.tagName === 'body')
}


/** @type {(document: dom.Document) => dom.Element | undefined} */
export function documentHead(document) {
  return qs(document, el => el.tagName === 'head')
}


/** @type {(document: dom.Element) => dom.ChildNode | null} */
export function nextSibling(el) {
  if (!el.parentNode) throw new Error('nextSibling: cannot find nextSibling for an Element without a parentNode')
  const idx = el.parentNode.childNodes.indexOf(el)
  if (idx < el.parentNode.childNodes.length - 1) return el.parentNode.childNodes[idx + 1]
  return null
}


/** @type {(el: dom.ParentNode, position:'beforebegin'|'afterbegin'|'beforeend'|'afterend', html: string) => {[id: string]: dom.Element}} */
export function insertAdjacentHTML(el, position, html) {
  if (!el || !position || !html) throw new Error('missing parameter')
  if (typeof html !== 'string') throw new TypeError('insertAdjacentHTML: html param must be a string')
  if (!adapter.isElementNode(el) || !el.parentNode) throw new Error('insertAdjacentHTML: el must be an HTMLElement with a parentNode')
  const fragment = parseFragment(html, el)
  if (position === 'beforebegin') {
    for (const child of fragment.childNodes) {
      insertBefore(child, el)
    }
  }
  if (position === 'afterbegin') {
    const firstChild = parse5.defaultTreeAdapter.getFirstChild(el)
    for (const child of fragment.childNodes) {
      if (firstChild) {
        insertBefore(child, firstChild)
      } else {
        appendChild(el, child)
      }
    }
  }
  if (position === 'beforeend') {
    for (const child of fragment.childNodes) {
      appendChild(el, child)
    }
  }
  if (position === 'afterend') {
    const nextSiblingNode = nextSibling(el)
    for (const child of fragment.childNodes) {
      if (nextSiblingNode) {
        insertBefore(child, nextSiblingNode)
      } else {
        appendChild(el.parentNode, child)
      }
    }
  }
  /** @type {{[id: string]: dom.Element}} */
  const result = {}
  for (const child of fragment.childNodes) {
    if (adapter.isElementNode(child)) {
      const idAttr = child.attrs.find(o => o.name === 'id')
      if (idAttr) result[idAttr.value] = child
    }
  }
  return result
}


/** @type {(html: string, elementContext?: dom.ParentNode | null) => dom.Element} */
export function createElementFromHTML(html, elementContext) {
  if (typeof html !== 'string') throw new TypeError('createElementFromHTML: html param must be a string')
  const fragment = parseFragment(html, elementContext)
  const childElements = qsa(fragment, o => o.parentNode === fragment)
  if (childElements.length !== 1) throw new Error('createElementFromHTML: html must have exactly one root element')
  return childElements[0]
}
