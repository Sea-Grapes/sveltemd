import { expect, test } from 'bun:test'
import remarkParse from 'remark-parse'
import { unified } from 'unified'
import { remarkSvelte } from '../../src/unified/remark'
import { SvmdParser } from '../../src'

const mdast_parser = unified().use(remarkParse).use(remarkSvelte)
const parser = new SvmdParser()

test('if: inline', async () => {
  const input = await parser.parse(
    `Inline test: {#if true}This is a **test**{/if}`
  )
  expect(input.code).toBe(
    `<p>Inline test: {#if true}This is a <strong>test</strong>{/if}</p>`
  )
})

test('if: newlines', async () => {
  const input = await parser.parse(`{#if true}\n# test\n{/if}`)

  expect(input.code).toBe(`{#if true}\n<h1>test</h1>\n{/if}`)
})
