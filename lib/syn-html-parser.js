import * as parse5 from 'parse5'

/**
 * @typedef {import('./types/parse5/tree-adapters/default.d.ts').Node} Node
 * @typedef {import('./types/parse5/tree-adapters/default.d.ts').ParentNode} ParentNode
 * @typedef {import('./types/parse5/tree-adapters/default.d.ts').ChildNode} ChildNode
 * @typedef {import('./types/parse5/tree-adapters/default.d.ts').Element} Element
 * @typedef {import('./types/parse5/tree-adapters/default.d.ts').TextNode} TextNode
 * @typedef {import('./types/parse5/tree-adapters/default.d.ts').Document} Document
 * @typedef {import('./types/parse5/tree-adapters/default.d.ts').DocumentFragment} DocumentFragment
 */


export const adapter = parse5.defaultTreeAdapter


/** @param {string} html */
export function parseHtml(html) {
  return parse5.parse(html)
}


/** 
 * @param {string} html 
 * @param {ParentNode?} fragmentContext
 * */
export function parseFragment(html, fragmentContext = null) {
  return parse5.parseFragment(fragmentContext, html, {})
}


/** @param {ParentNode} node */
export function serialize(node) {
  return parse5.serialize(node)
}


/** @param {Node} node */
export function serializeOuter(node) {
  return parse5.serializeOuter(node)
}


/** 
 * @param {string} tagName
 * @param {{[name: string]: string | undefined}} [attributes={}]
 * */
export function createElement(tagName, attributes = {}) {
  const attrs = Object.entries(attributes).map(([name, value]) => ({ name, value: value ?? '' }))
  return adapter.createElement(tagName, parse5.html.NS.HTML, attrs)
}


/** @type {(newChild: ChildNode, refChild: ChildNode) => void} */
export function insertBefore(newChild, refChild) {
  if (!newChild || !refChild) throw new Error('missing parameter')
  if (!refChild.parentNode) throw new Error('insertBefore Error: refChild has no parent element')
  adapter.insertBefore(refChild.parentNode, newChild, refChild)
}


/** @type {(refNode: ChildNode, text: string) => void} */
export function insertTextBefore(refNode, text) {
  if (!refNode || text == null) throw new Error('missing parameter')
  if (!refNode.parentNode) throw new Error('insertBefore Error: refNode has no parent element')
  adapter.insertTextBefore(refNode.parentNode, text, refNode)
}


/** @type {(parentNode: ParentNode, newNode: ChildNode) => void} */
export function appendChild(parentNode, newNode) {
  if (!parentNode || !newNode) throw new Error('missing parameter')
  adapter.appendChild(parentNode, newNode)
}


/** @type {(parentNode: ParentNode, text: string) => void} */
export function insertText(parentNode, text) {
  if (!parentNode || text == null) throw new Error('missing parameter')
  return adapter.insertText(parentNode, text)
}


/** @param {ChildNode} node */
export function detachNode(node) {
  if (!node) throw new Error('missing parameter')
  adapter.detachNode(node)
}


/** @type {(node: Node) => node is Element} */
export function isElementNode(node) {
  return adapter.isElementNode(node)
}


/** @type {(node: Node) => node is TextNode} */
export function isTextNode(node) {
  return adapter.isTextNode(node)
}




/**
 *   CUSTOM FUNCTIONS
 */



/** 
 * searches for any node matching the predicate
 * @type {(node: ParentNode, predicate: (node: Node) => boolean) => Node | undefined} 
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
 * @type {(node: ParentNode, predicate: (node: Node) => boolean, res?: Node[]) => Node[]} 
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
 * @type {(node: ParentNode, predicate: (node: Element) => boolean) => Element | undefined}
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
 * @type {(node: ParentNode, predicate: (node: Element) => boolean, res?: Element[]) => Element[]} 
 * */
export function qsa(node, predicate, res = []) {
  if (adapter.isElementNode(node) && predicate(node)) res.push(node)
  for (let child of node.childNodes) {
    if (adapter.isElementNode(child)) qsa(child, predicate, res)
  }
  return res
}


/** @type {(el: ParentNode, html: string) => void} */
export function innerHTML(el, html) {
  if (!el || html == null) throw new Error('missing parameter')
  if (!(typeof html === 'string')) throw new TypeError('innerHTML: html param must be a string')
  el.childNodes = []
  const fragment = parseFragment(html, el)
  for (const child of fragment.childNodes) {
    appendChild(el, child)
  }
}


/** @param {Element} el */
export function cloneElement(el) {
  if (!el) throw new Error('missing parameter')
  const html = serializeOuter(el)
  return createElementFromHTML(html)
}


/** @type {(document: Document) => Element | undefined} */
export function documentBody(document) {
  return qs(document, el => el.tagName === 'body')
}


/** @type {(document: Document) => Element | undefined} */
export function documentHead(document) {
  return qs(document, el => el.tagName === 'head')
}


/** @type {(document: Element) => ChildNode | null} */
export function nextSibling(el) {
  if (!el.parentNode) throw new Error('nextSibling: cannot find nextSibling for an Element without a parentNode')
  const idx = el.parentNode.childNodes.indexOf(el)
  if (idx < el.parentNode.childNodes.length - 1) return el.parentNode.childNodes[idx + 1]
  return null
}


/** @type {(el: ParentNode, position:'beforebegin'|'afterbegin'|'beforeend'|'afterend', html: string) => {[id: string]: Element}} */
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
  /** @type {{[id: string]: Element}} */
  const result = {}
  for (const child of fragment.childNodes) {
    if (adapter.isElementNode(child)) {
      const idAttr = child.attrs.find(o => o.name === 'id')
      if (idAttr) result[idAttr.value] = child
    }
  }
  return result
}


/** @type {(html: string, elementContext?: ParentNode | null) => Element} */
export function createElementFromHTML(html, elementContext) {
  if (typeof html !== 'string') throw new TypeError('createElementFromHTML: html param must be a string')
  const fragment = parseFragment(html, elementContext)
  const childElements = qsa(fragment, o => o.parentNode === fragment)
  if (childElements.length !== 1) throw new Error('createElementFromHTML: html must have exactly one root element')
  return childElements[0]
}


/** @type {(node: Node) => { [name: string]: string | undefined }} */
export function getAttributes(node) {
  if (!('attrs' in node)) return {}
  /** @type {{[name: string]: string}} */
  const attributes = {}
  for (const attr of node.attrs) {
    attributes[attr.name] = attr.value
  }
  return attributes
}


/** @type {(newChild: ChildNode, refChild: ChildNode) => void} */
export function insertAfter(newChild, refChild) {
  if (!newChild || !refChild) throw new Error('missing parameter')
  if (!refChild.parentNode) throw new Error('insertAfter Error: refChild has no parent element')
  const refIndex = refChild.parentNode.childNodes.indexOf(refChild)
  refChild.parentNode.childNodes.splice(refIndex + 1, 0, newChild)
  newChild.parentNode = refChild.parentNode
}


/** @type {(el: Element, attributeName: string) => void} */
export function removeAttribute(el, attributeName) {
  if (!el || !attributeName) throw new Error('missing parameter')
  const attrIndex = el.attrs.findIndex(o => o.name === attributeName)
  if (attrIndex !== -1) el.attrs.splice(attrIndex, 1)
}


/** @type {(el: Element, attributeName: string, attributeValue: string) => void} */
export function setAttribute(el, attributeName, attributeValue) {
  if (!el || !attributeName || attributeValue === undefined) throw new Error('missing parameter')
  const attr = el.attrs.find(o => o.name === attributeName)
  if (attr) {
    attr.value = attributeValue
  } else {
    el.attrs.push({ name: attributeName, value: attributeValue })
  }
}


/** @type {(el: Element, attributeName: string) => string | undefined} */
export function getAttribute(el, attributeName) {
  if (!el || !attributeName) throw new Error('missing parameter')
  const attr = el.attrs.find(o => o.name === attributeName)
  return attr?.value
}