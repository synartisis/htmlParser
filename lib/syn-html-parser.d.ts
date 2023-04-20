export function parseHtml(html: string): dom['document'];
export function parseFragment(html: string, fragmentContext?: dom['parentNode']): dom['documentFragment'];
export function serialize(node: dom['parentNode']): string;
export function serializeOuter(node: dom['parentNode']): string;
export function createElement(tagName: Lowercase<keyof typeof parse5.html.TAG_NAMES>, attributes?: {
    [name: string]: string;
}): dom['element'];
export function insertBefore(newChild: dom['childNode'], refChild: dom['childNode']): void;
export function insertTextBefore(refNode: dom['childNode'], text: string): void;
export function appendChild(parentNode: dom['parentNode'], newNode: dom['childNode']): void;
export function insertText(parentNode: dom['parentNode'], text: string): void;
export function detachNode(node: dom['childNode']): void;
export function isElementNode(node: dom['node']): node is dom['element'];
export function isTextNode(node: dom['node']): node is dom['textNode'];
export function findOne(node: dom['parentNode'], predicate: (node: dom['node']) => boolean): dom['node'] | undefined;
export function findAll(node: dom['parentNode'], predicate: (node: dom['node']) => boolean, res?: dom['node'][]): dom['node'][];
export function qs(node: dom['parentNode'], predicate: (node: dom['element']) => boolean): dom['element'] | undefined;
export function qsa(node: dom['parentNode'], predicate: (node: dom['element']) => boolean, res?: dom['element'][]): dom['element'][];
export function innerHTML(el: dom['parentNode'], html: string): void;
export function cloneElement(el: dom['element']): dom['element'];
export function documentBody(document: dom['document']): dom['element'] | undefined;
export function documentHead(document: dom['document']): dom['element'] | undefined;
export function nextSibling(document: dom['element']): dom['childNode'] | null;
export function insertAdjacentHTML(el: dom['parentNode'], position: 'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend', html: string): {
    [id: string]: dom['element'];
};
export function createElementFromHTML(html: string, elementContext?: dom['parentNode']): dom['element'];
export function getAttributes(node: dom['node']): {
    [name: string]: string;
};
export function insertAfter(newChild: dom['childNode'], refChild: dom['childNode']): void;
export function removeAttribute(el: dom['element'], attributeName: string): void;
export function setAttribute(el: dom['element'], attributeName: string, attributeValue: string): void;
export function getAttribute(el: dom['element'], attributeName: string): string | undefined;
/** @typedef {import('parse5').DefaultTreeAdapterMap} dom */
export const adapter: parse5.TreeAdapter<parse5.DefaultTreeAdapterMap>;
export type dom = import('parse5').DefaultTreeAdapterMap;
import * as parse5 from 'parse5';
