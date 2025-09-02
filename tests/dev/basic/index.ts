import { parse } from '../../../src'

const path = 'basic/test.md'
const file = Bun.file(path)

const text = await file.text()
const parsed_file = parse(text)
console.log('Tests complete')
