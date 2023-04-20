export function parseHtml(html: string): Document;
export function parseFragment(html: string, fragmentContext?: ParentNode): DocumentFragment;
export function serialize(node: ParentNode): string;
export function serializeOuter(node: ParentNode): string;
export function createElement(tagName: Lowercase<keyof typeof parse5.html.TAG_NAMES>, attributes?: {
    [name: string]: string;
}): Element;
export function insertBefore(newChild: ChildNode, refChild: ChildNode): void;
export function insertTextBefore(refNode: ChildNode, text: string): void;
export function appendChild(parentNode: ParentNode, newNode: ChildNode): void;
export function insertText(parentNode: ParentNode, text: string): void;
export function detachNode(node: ChildNode): void;
export function isElementNode(node: Node): node is Element;
export function isTextNode(node: Node): node is TextNode;
export function findOne(node: ParentNode, predicate: (node: Node) => boolean): Node | undefined;
export function findAll(node: ParentNode, predicate: (node: Node) => boolean, res?: Node[]): Node[];
export function qs(node: ParentNode, predicate: (node: Element) => boolean): Element | undefined;
export function qsa(node: ParentNode, predicate: (node: Element) => boolean, res?: Element[]): Element[];
export function innerHTML(el: ParentNode, html: string): void;
export function cloneElement(el: Element): Element;
export function documentBody(document: Document): Element | undefined;
export function documentHead(document: Document): Element | undefined;
export function nextSibling(document: Element): ChildNode | null;
export function insertAdjacentHTML(el: ParentNode, position: 'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend', html: string): {
    [id: string]: Element;
};
export function createElementFromHTML(html: string, elementContext?: ParentNode): Element;
export function getAttributes(node: Node): {
    [name: string]: string;
};
export function insertAfter(newChild: ChildNode, refChild: ChildNode): void;
export function removeAttribute(el: Element, attributeName: string): void;
export function setAttribute(el: Element, attributeName: string, attributeValue: string): void;
export function getAttribute(el: Element, attributeName: string): string | undefined;
/**
 * @typedef {import('parse5').DefaultTreeAdapterMap} dom
 * @typedef {dom['document']} Document
 * @typedef {dom['documentFragment']} DocumentFragment
 * @typedef {dom['node']} Node
 * @typedef {dom['parentNode']} ParentNode
 * @typedef {dom['childNode']} ChildNode
 * @typedef {dom['element']} Element
 * @typedef {dom['textNode']} TextNode
 * */
export const adapter: parse5.TreeAdapter<parse5.DefaultTreeAdapterMap>;
export type dom = import('parse5').DefaultTreeAdapterMap;
export type Document = dom['document'];
export type DocumentFragment = dom['documentFragment'];
export type Node = dom['node'];
export type ParentNode = dom['parentNode'];
export type ChildNode = dom['childNode'];
export type Element = dom['element'];
export type TextNode = dom['textNode'];
import * as parse5 from 'parse5';
