import { parse } from '../../src/'

const path = './test.md'
const file = Bun.file(path)

const text = await file.text()
const parsed_file = parse(text)