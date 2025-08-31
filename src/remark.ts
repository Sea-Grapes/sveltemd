import { Code, InlineCode, Root } from 'mdast'
import { codeToHtml, type CodeToHastOptions } from 'shiki'
import { Plugin } from 'unified'
import { visit } from 'unist-util-visit'
import { micromarkSvelteExtension } from './micromark.js'

export const remarkSvelte: Plugin = function () {
  const data = this.data()

  const micromarkExtensions =
    data.micromarkExtensions || (data.micromarkExtensions = [])

  micromarkExtensions.push(micromarkSvelteExtension())
}

export function remarkShiki(shikiOptions: Omit<CodeToHastOptions, 'lang'>) {
  async function process(node: Code | InlineCode) {
    if (node.type === 'code') {
      const lang = node.lang || 'text'
      const options: CodeToHastOptions = {
        theme: 'dark-plus',
        ...(shikiOptions || {}),
        lang,
      }

      node.value = await codeToHtml(node.value, {
        theme: 'dark-plus',
        ...(shikiOptions || {}),
        lang,
      })
      // @ts-ignore
      node.type = 'html'
      node.value = node.value.replaceAll('{', '&#123;')
    }
  }

  return async function (tree: Root) {
    let nodes: any[] = []

    visit(tree, 'code', (node) => nodes.push(node))
    visit(tree, 'inlineCode', (node) => nodes.push(node))

    await Promise.all(nodes.map((node) => process(node)))
  }
}
