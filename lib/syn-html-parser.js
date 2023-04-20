import * as parse5 from 'parse5'

/** @typedef {import('parse5').DefaultTreeAdapterMap} dom */


export const adapter = parse5.defaultTreeAdapter


/** @type {(html: string) => dom['document']} */
export function parseHtml(html) {
  if (typeof html !== 'string') throw new SyntaxError('wrong parameters')
  return parse5.parse(html)
}


/** @type {(html: string, fragmentContext?: dom['parentNode']) => dom['documentFragment']} */
export function parseFragment(html, fragmentContext) {
  if (typeof html !== 'string') throw new SyntaxError('wrong parameters')
  return parse5.parseFragment(fragmentContext ?? null, html, {})
}


/** @type {(node: dom['parentNode']) => string} */
export function serialize(node) {
  if (!node) throw new SyntaxError('wrong parameters')
  return parse5.serialize(node)
}


/** @type {(node: dom['parentNode']) => string} */
export function serializeOuter(node) {
  if (!node) throw new SyntaxError('wrong parameters')
  return parse5.serializeOuter(node)
}


/** @type {(tagName: Lowercase<keyof typeof parse5.html.TAG_NAMES>, attributes?: {[name: string]: string}) => dom['element']} */
export function createElement(tagName, attributes = {}) {
  if (typeof tagName !== 'string') throw new SyntaxError('wrong parameters')
  const attrs = Object.entries(attributes).map(([name, value]) => ({ name, value: value ?? '' }))
  return adapter.createElement(tagName, parse5.html.NS.HTML, attrs)
}


/** @type {(newChild: dom['childNode'], refChild: dom['childNode']) => void} */
export function insertBefore(newChild, refChild) {
  if (!newChild || !refChild) throw new SyntaxError('wrong parameters')
  if (!refChild.parentNode) throw new Error('insertBefore Error: refChild has no parent element')
  adapter.insertBefore(refChild.parentNode, newChild, refChild)
}


/** @type {(refNode: dom['childNode'], text: string) => void} */
export function insertTextBefore(refNode, text) {
  if (!refNode || typeof text !== 'string') throw new SyntaxError('wrong parameters')
  if (!refNode.parentNode) throw new Error('insertTextBefore Error: refNode has no parent element')
  adapter.insertTextBefore(refNode.parentNode, text, refNode)
}


/** 
 * Appends a child node to the given parent node.
 * @type {(parentNode: dom['parentNode'], newNode: dom['childNode']) => void} 
 * */
export function appendChild(parentNode, newNode) {
  if (!parentNode || !newNode) throw new SyntaxError('wrong parameters')
  adapter.appendChild(parentNode, newNode)
}


/** @type {(parentNode: dom['parentNode'], text: string) => void} */
export function insertText(parentNode, text) {
  if (!parentNode || typeof text !== 'string') throw new SyntaxError('wrong parameters')
  return adapter.insertText(parentNode, text)
}


/** @type {(node: dom['childNode']) => void} */
export function detachNode(node) {
  if (!node) throw new SyntaxError('wrong parameters')
  adapter.detachNode(node)
}


/** @type {(node: dom['node']) => node is dom['element']} */
export function isElementNode(node) {
  if (!node) throw new SyntaxError('wrong parameters')
  return adapter.isElementNode(node)
}


/** @type {(node: dom['node']) => node is dom['textNode']} */
export function isTextNode(node) {
  if (!node) throw new SyntaxError('wrong parameters')
  return adapter.isTextNode(node)
}




/**
 *   CUSTOM FUNCTIONS
 */



/** 
 * searches for any node matching the predicate
 * @type {(node: dom['parentNode'], predicate: (node: dom['node']) => boolean) => dom['node'] | undefined} 
 */
export function findOne(node, predicate) {
  if (!node || typeof predicate !== 'function') throw new SyntaxError('wrong parameters')
  let result
  if (predicate(node)) {
    result = node
  } else {
    for (let child of node.childNodes) {
      if (isElementNode(child)) result = findOne(child, predicate)
      if (predicate(child)) result = child
      if (result) break
    }
  }
  return result
}


/** 
 * searches for any nodes matching the predicate
 * @type {(node: dom['parentNode'], predicate: (node: dom['node']) => boolean, res?: dom['node'][]) => dom['node'][]} 
 * */
export function findAll(node, predicate, res = []) {
  if (!node || typeof predicate !== 'function') throw new SyntaxError('wrong parameters')
  if (predicate(node)) res.push(node)
  for (let child of node.childNodes) {
    if (isElementNode(child)) {
      findAll(child, predicate, res)
    } else {
      if (predicate(child)) res.push(child)
    }
  }
  return res
}



/** 
 * searches for an Element matching the predicate
 * @type {(node: dom['parentNode'], predicate: (node: dom['element']) => boolean) => dom['element'] | undefined}
 * */
export function qs(node, predicate) {
  if (!node || typeof predicate !== 'function') throw new SyntaxError('wrong parameters')
  let result
  if (isElementNode(node) && predicate(node)) {
    result = node
  } else {
    for (let child of node.childNodes) {
      if (isElementNode(child)) result = qs(child, predicate)
      if (result) break
    }
  }
  return result
}


/** 
 * searches for any Elements matching the predicate
 * @type {(node: dom['parentNode'], predicate: (node: dom['element']) => boolean, res?: dom['element'][]) => dom['element'][]} 
 * */
export function qsa(node, predicate, res = []) {
  if (!node || typeof predicate !== 'function') throw new SyntaxError('wrong parameters')
  if (isElementNode(node) && predicate(node)) res.push(node)
  for (let child of node.childNodes) {
    if (isElementNode(child)) qsa(child, predicate, res)
  }
  return res
}


/** @type {(el: dom['parentNode'], html: string) => void} */
export function innerHTML(el, html) {
  if (!el || typeof html !== 'string') throw new SyntaxError('wrong parameters')
  el.childNodes = []
  const fragment = parseFragment(html, el)
  for (const child of fragment.childNodes) {
    appendChild(el, child)
  }
}


/** @type {(el: dom['element']) => dom['element']} */
export function cloneElement(el) {
  if (!el) throw new SyntaxError('wrong parameters')
  const html = serializeOuter(el)
  return createElementFromHTML(html)
}


/** @type {(document: dom['document']) => dom['element'] | undefined} */
export function documentBody(document) {
  if (!document) throw new SyntaxError('wrong parameters')
  return qs(document, el => el.tagName === 'body')
}


/** @type {(document: dom['document']) => dom['element'] | undefined} */
export function documentHead(document) {
  if (!document) throw new SyntaxError('wrong parameters')
  return qs(document, el => el.tagName === 'head')
}


/** @type {(document: dom['element']) => dom['childNode'] | null} */
export function nextSibling(el) {
  if (!el) throw new SyntaxError('wrong parameters')
  if (!el.parentNode) throw new Error('nextSibling: cannot find nextSibling for an Element without a parentNode')
  const idx = el.parentNode.childNodes.indexOf(el)
  if (idx < el.parentNode.childNodes.length - 1) return el.parentNode.childNodes[idx + 1]
  return null
}


/** @type {(el: dom['parentNode'], position:'beforebegin'|'afterbegin'|'beforeend'|'afterend', html: string) => { [id: string]: (dom['element']) }} */
export function insertAdjacentHTML(el, position, html) {
  if (!el || !position || typeof html !== 'string') throw new SyntaxError('wrong parameters')
  if (!isElementNode(el) || !el.parentNode) throw new Error('insertAdjacentHTML: el must be an HTMLElement with a parentNode')
  const fragment = parseFragment(html, el)
  if (position === 'beforebegin') {
    for (const child of fragment.childNodes) {
      insertBefore(child, el)
    }
  }
  if (position === 'afterbegin') {
    const firstChild = adapter.getFirstChild(el)
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
  /** @type {{[id: string]: dom['element']}} */
  const result = {}
  for (const child of fragment.childNodes) {
    if (isElementNode(child)) {
      const idAttr = child.attrs.find(o => o.name === 'id')
      if (idAttr) result[idAttr.value] = child
    }
  }
  return result
}


/** @type {(html: string, elementContext?: dom['parentNode']) => dom['element']} */
export function createElementFromHTML(html, elementContext) {
  if (typeof html !== 'string') throw new SyntaxError('wrong parameters')
  const fragment = parseFragment(html, elementContext)
  const childElements = fragment.childNodes.filter(isElementNode)
  if (childElements.length !== 1) throw new Error('createElementFromHTML: html must have exactly one root element')
  return childElements[0]
}


/** @type {(node: dom['node']) => { [name: string]: string | undefined }} */
export function getAttributes(node) {
  if (!node) throw new SyntaxError('wrong parameters')
  if (!('attrs' in node)) return {}
  /** @type {{[name: string]: string}} */
  const attributes = {}
  for (const attr of node.attrs) {
    attributes[attr.name] = attr.value
  }
  return attributes
}


/** @type {(newChild: dom['childNode'], refChild: dom['childNode']) => void} */
export function insertAfter(newChild, refChild) {
  if (!newChild || !refChild) throw new SyntaxError('wrong parameters')
  if (!refChild.parentNode) throw new Error('insertAfter Error: refChild has no parent element')
  const refIndex = refChild.parentNode.childNodes.indexOf(refChild)
  refChild.parentNode.childNodes.splice(refIndex + 1, 0, newChild)
  newChild.parentNode = refChild.parentNode
}


/** @type {(el: dom['element'], attributeName: string) => void} */
export function removeAttribute(el, attributeName) {
  if (!el || typeof attributeName !== 'string') throw new SyntaxError('wrong parameters')
  const attrIndex = el.attrs.findIndex(o => o.name === attributeName)
  if (attrIndex !== -1) el.attrs.splice(attrIndex, 1)
}


/** @type {(el: dom['element'], attributeName: string, attributeValue: string) => void} */
export function setAttribute(el, attributeName, attributeValue) {
  if (!el || typeof attributeName !== 'string' || attributeValue === undefined) throw new SyntaxError('wrong parameters')
  const attr = el.attrs.find(o => o.name === attributeName)
  if (attr) {
    attr.value = attributeValue
  } else {
    el.attrs.push({ name: attributeName, value: attributeValue })
  }
}


/** @type {(el: dom['element'], attributeName: string) => string | undefined} */
export function getAttribute(el, attributeName) {
  if (!el || typeof attributeName !== 'string') throw new SyntaxError('wrong parameters')
  const attr = el.attrs.find(o => o.name === attributeName)
  return attr?.value
}