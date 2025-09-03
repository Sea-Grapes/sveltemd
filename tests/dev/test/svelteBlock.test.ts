import { expect, test } from 'bun:test'
import remarkParse from 'remark-parse'
import { unified } from 'unified'
import { remarkSvelte } from '../../../src/unified/remark'
import { SvmdParser } from '../../../src'

const mdast_parser = unified().use(remarkParse).use(remarkSvelte)
const parser = new SvmdParser()

test('string: basic if', async () => {
  const input = await parser.parse(`{#if true}\n# test\n{/if}`)

  expect(input.code).toBe(`<p>{#if true}<h1>test</h1>{/if}</p>`)
})