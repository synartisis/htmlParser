import * as parse5 from 'parse5'
import * as htmlparser2Adapter from 'parse5-htmlparser2-tree-adapter'
import * as domhandler from 'domhandler'
export { domhandler }

// TAG_TYPES: tag, script, style

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


/** @type {(refNode: domhandler.ChildNode, text: string) => void} */
export function insertTextBefore(refNode, text) {
  if (!refNode || !text) throw new Error('missing parameter')
  if (!refNode.parent) throw new Error('insertBefore Error: refNode has no parent element')
  adapter.insertTextBefore(refNode.parent, text, refNode)
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
 * @type {(node: domhandler.ParentNode, predicate: (node: domhandler.AnyNode) => boolean) => domhandler.AnyNode | undefined} 
 */
export function findOne(node, predicate) {
  let result
  if (predicate(node)) {
    result = node
  } else {
    for (let child of node.children) {
      if (adapter.isElementNode(child)) result = findOne(child, predicate)
      if (predicate(child)) result = child
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
  if ((node.type === 'tag' || node.type === 'script' || node.type === 'style') && predicate(node)) {
    result = node
  } else {
    for (let child of node.children) {
      if (child.type === 'tag' || child.type === 'script' || child.type === 'style') result = qs(child, predicate)
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
  if ((node.type === 'tag' || node.type === 'script' || node.type === 'style') && predicate(node)) res.push(node)
  for (let child of node.children) {
    if (child.type === 'tag' || child.type === 'script' || child.type === 'style') qsa(child, predicate, res)
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
    appendChild(el, child)
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


/** @type {(document: domhandler.Document) => domhandler.Element | undefined} */
export function documentHead(document) {
  return qs(document, el => el.name === 'head')
}


/** @type {(el: domhandler.ParentNode, position:'beforebegin'|'afterbegin'|'beforeend'|'afterend', html: string) => domhandler.Element | undefined} */
export function insertAdjacentHTML(el, position, html) {
  if (!el || !position || !html) throw new Error('missing parameter')
  if (typeof html !== 'string') throw new TypeError('insertAdjacentHTML: html param must be a string')
  if (position === 'beforebegin') {
    const fragment = parseFragment(html, el)
    for (const child of fragment.children) {
      insertBefore(child, el)
    }
    const childElements = fragment.children.filter(o => o.type === 'tag' || o.type === 'script' || o.type === 'style')
    if (childElements.length === 1 && (childElements[0].type === 'tag' || childElements[0].type === 'script' || childElements[0].type === 'style')) return childElements[0]
  }
  if (position === 'afterbegin') {
    const firstChild = adapter.getFirstChild(el)
    const fragment = parseFragment(html, el)
    for (const child of fragment.children) {
      if (firstChild) {
        insertBefore(child, firstChild)
      } else {
        appendChild(el, child)
      }
    }
  }
  if (position === 'beforeend') {
    const fragment = parseFragment(html, el)
    for (const child of fragment.children) {
      appendChild(el, child)
    }
    const childElements = fragment.children.filter(o => o.type === 'tag' || o.type === 'script' || o.type === 'style')
    if (childElements.length === 1 && (childElements[0].type === 'tag' || childElements[0].type === 'script' || childElements[0].type === 'style')) return childElements[0]
  }
  if (position === 'afterend') {
    if (!el.parentNode) throw new Error('insertAdjacentHTML - afterend: el must have a parentNode')
    const nextSibling = el.nextSibling
    const fragment = parseFragment(html, el)
    for (const child of fragment.children) {
      if (nextSibling) {
        insertBefore(child, nextSibling)
      } else {
        appendChild(el.parentNode, child)
      }
    }
    const childElements = fragment.children.filter(o => o.type === 'tag' || o.type === 'script' || o.type === 'style')
    if (childElements.length === 1 && (childElements[0].type === 'tag' || childElements[0].type === 'script' || childElements[0].type === 'style')) return childElements[0]

  }
}

