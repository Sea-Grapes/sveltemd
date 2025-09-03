import { parse } from '../../src'

const path = 'basic/test.md'
const file = Bun.file(path)

const text = await file.text()
const parsed_file = await parse(text)
console.log(parsed_file.code)
console.log('Tests complete')
