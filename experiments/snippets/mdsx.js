var __require = /* @__PURE__ */ ((x) =>
  typeof require !== 'undefined'
    ? require
    : typeof Proxy !== 'undefined'
    ? new Proxy(x, {
        get: (a, b) => (typeof require !== 'undefined' ? require : a)[b],
      })
    : x)(function (x) {
  if (typeof require !== 'undefined') return require.apply(this, arguments)
  throw Error('Dynamic require of "' + x + '" is not supported')
})

// src/compile.ts
import MagicString from 'magic-string'
import { VFile as VFile3 } from 'vfile'
import { parse as parse2, preprocess as preprocess2 } from 'svelte/compiler'

// src/constants.ts
var MDSX_PREFIX = 'MDSX__'
var MDSX_BLUEPRINT_NAME = `${MDSX_PREFIX}Blueprint`
var MDSX_COMPONENT_NAME = `${MDSX_PREFIX}Component`

// src/matter.ts
import yaml from 'yaml'
import 'vfile'

// src/utils.ts
import path from 'path'
import { walk } from 'zimmerframe'
import { print } from 'esrap'
import 'vfile'
function toPOSIX(joinedPath) {
  const a = performance.now()
  const isExtendedLengthPath = /^\\\\\?\\/.test(joinedPath)
  const hasNonAscii = /[^\0-\x80]+/.test(joinedPath)
  if (isExtendedLengthPath || hasNonAscii) {
    return joinedPath
  }
  logPerf('toPOSIX', a)
  return joinedPath.replace(/\\/g, '/')
}
function getRelativeFilePath(from, to) {
  const transformedA = path.resolve(from, '..')
  const relativePath = toPOSIX(path.relative(transformedA, to))
  if (!relativePath.startsWith('.')) {
    return `./${relativePath}`
  }
  return relativePath
}
function extractNamedExports(ast) {
  const a = performance.now()
  const exportedComponentNames = []
  const state = {}
  walk(ast.content, state, {
    ExportNamedDeclaration(node) {
      for (const specifier of node.specifiers) {
        exportedComponentNames.push(specifier.exported.name)
      }
    },
  })
  logPerf('extractNamedExports', a)
  return exportedComponentNames
}
function updateOrCreateSvelteInstance(ast, filePath, blueprintPath) {
  const a = performance.now()
  const importStatement = `import ${MDSX_BLUEPRINT_NAME}, * as ${MDSX_COMPONENT_NAME} from "${getRelativeFilePath(
    filePath,
    blueprintPath
  )}"`
  if (!ast) {
    const content2 = `<script>${importStatement}</script>`
    logPerf('updateOrCreateSvelteInstance', a)
    return {
      start: 0,
      end: 0,
      content: content2,
    }
  }
  const { code } = print(ast.content)
  const content = `<script>
${importStatement}
${code}
</script>`
  logPerf('updateOrCreateSvelteInstance', a)
  return {
    start: ast.start,
    end: ast.end,
    content,
  }
}
function updateOrCreateSvelteModule(ast, data) {
  const a = performance.now()
  const metadataStr = JSON.stringify(data.matter)
  const exportStatement = `export const metadata = ${metadataStr};
`
  const metadataKeys = Object.keys(data.matter)
  let metadataDeclaration = void 0
  if (metadataKeys.length > 0) {
    metadataDeclaration = `const { ${metadataKeys.join(', ')} } = metadata;`
  }
  const statement = exportStatement + (metadataDeclaration ?? '')
  if (!ast) {
    const content2 = `<script module>${statement}</script>`
    logPerf('updateOrCreateSvelteModule', a)
    return {
      start: 0,
      end: 0,
      content: content2,
    }
  }
  const { code } = print(ast.content)
  const content = `<script module>
${statement}
${code}
</script>`
  logPerf('updateOrCreateSvelteModule', a)
  return {
    start: ast.start,
    end: ast.end,
    content,
  }
}
function getBlueprintData(file, config) {
  if (!config?.blueprints) return
  const a = performance.now()
  const data = file.data
  const blueprintName = data.matter?.blueprint ?? 'default'
  if (blueprintName === false) return
  if (typeof blueprintName !== 'string') {
    throw new Error(
      `The "blueprint" name in the frontmatter must be a string in "${file.path}"`
    )
  }
  const blueprint = config.blueprints[blueprintName]
  if (blueprint === void 0) {
    throw Error(
      `Blueprint "${blueprintName}" is not defined in the blueprint map in the MDSX config`
    )
  }
  logPerf('getBlueprintData', a)
  return Object.assign(blueprint, {
    name: blueprintName,
    remarkPlugins: blueprint.remarkPlugins ?? [],
    rehypePlugins: blueprint.rehypePlugins ?? [],
  })
}
function logPerf(name, startTime) {
  if (process.env?.MDSX_LOG_LEVEL === 'debug') {
    console.log(`${name}: `, performance.now() - startTime)
  }
}

// src/matter.ts
var regex = /^---(?:\r?\n|\r)(?:([\s\S]*?)(?:\r?\n|\r))?---(?:\r?\n|\r|$)/
function matter(file, customParser) {
  const doc = String(file)
  const a = performance.now()
  if (customParser) {
    const parsed = customParser(doc)
    if (parsed) {
      file.data.matter = parsed
    } else {
      file.data.matter = {}
    }
    logPerf('matter', a)
    return
  }
  const match = regex.exec(String(file))
  if (match && match[1]) {
    file.data.matter = yaml.parse(match[1])
    const stripped = doc.slice(match[0].length)
    file.value =
      file.value && typeof file.value === 'object'
        ? new TextEncoder().encode(stripped)
        : stripped
  } else {
    file.data.matter = {}
  }
  logPerf('matter', a)
}

// src/compile.ts
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'

// src/plugins/rehype.ts
import fs from 'fs'
import path2 from 'path'
import { visit } from 'unist-util-visit'
import { toHtml } from 'hast-util-to-html'

// ../common/src/constants.ts
var ENTITIES = {
  LEFT_CURLY: '&#123;',
  RIGHT_CURLY: '&#125;',
  LEFT_ANGLE: '&#60;',
  RIGHT_ANGLE: '&#62;',
  BACK_TICK: '&#96;',
  BACK_SLASH: '&#92;',
}

// ../common/src/index.ts
function escapeSvelte(str) {
  return str
    .replace(/[{}`]/g, (c) => {
      if (c === '{') return ENTITIES.LEFT_CURLY
      if (c === '}') return ENTITIES.RIGHT_CURLY
      if (c === '`') return ENTITIES.BACK_TICK
    })
    .replace(/\\([trn])/g, '&#92;$1')
}

// src/plugins/rehype.ts
import { parse, preprocess } from 'svelte/compiler'
function rehypeRenderCode() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      const tags = ['pre', 'code']
      if (!tags.includes(node.tagName)) return
      let codeEl
      if (node.tagName === 'pre') {
        codeEl = node.children[0]
        if (!codeEl || codeEl.type !== 'element' || codeEl.tagName !== 'code')
          return
      } else {
        codeEl = node
      }
      const codeString = toHtml(codeEl, {
        characterReferences: { useNamedReferences: true },
      })
      codeEl.type = 'raw'
      codeEl.value = `{@html \`${escapeSvelte(codeString)}\`}`
    })
  }
}
function rehypeBuildBlueprint() {
  return async (tree, file) => {
    const a = performance.now()
    const data = file.data
    const blueprint = data.blueprint
    if (blueprint === void 0) return
    const source = fs.readFileSync(blueprint.path, { encoding: 'utf8' })
    const filename = path2.parse(blueprint.path).base
    const { code, dependencies } = await preprocess(
      source,
      data.preprocessors,
      { filename }
    )
    if (dependencies) data.dependencies.push(...dependencies)
    const ast = parse(code, { filename })
    const module = ast.module
    if (module === void 0) {
      throw new Error(
        `Blueprint "${blueprint.name}" at path "${blueprint.path}" is missing it's exported components - See TODO: Add a link to docs here`
      )
    }
    const namedExports = extractNamedExports(module)
    if (namedExports.length > 0) {
      data.components = namedExports
    }
    logPerf('rehypeBuildBlueprint', a)
  }
}
function rehypeSvelteOverrideComponents() {
  return (tree, file) => {
    const a = performance.now()
    const data = file.data
    if (!data.blueprint) return
    const components = data.components
    if (!components) return
    visit(tree, 'element', (node) => {
      if (components.includes(node.tagName)) {
        node.tagName = `${MDSX_COMPONENT_NAME}.${node.tagName}`
      }
    })
    logPerf('rehypeSvelteOverrideComponents', a)
  }
}

// src/plugins/remark.ts
import { toMarkdown } from 'mdast-util-to-markdown'
import { CONTINUE, SKIP, visit as visit2 } from 'unist-util-visit'
var SVELTE_LOGIC_BLOCK = /{[#:/@]\w+.*}/
var ELEMENT_OR_COMPONENT = /<[A-Za-z]+[\s\S]*>/
function isSvelteBlock(value) {
  return SVELTE_LOGIC_BLOCK.test(value)
}
function isElementOrComponent(value) {
  return ELEMENT_OR_COMPONENT.test(value)
}
function remarkCleanSvelte() {
  return async (tree) => {
    visit2(tree, 'paragraph', (node) => {
      const firstChild = node.children[0]
      if (!firstChild) return CONTINUE
      if (firstChild.type !== 'text' && firstChild.type !== 'html')
        return CONTINUE
      if (
        isSvelteBlock(firstChild.value) ||
        isElementOrComponent(firstChild.value)
      ) {
        convertParagraphToHtml(node)
        return SKIP
      }
    })
  }
}
function convertParagraphToHtml(node) {
  let value = ''
  for (const child of node.children) {
    if (child.type === 'text' || child.type === 'html') {
      value += child.value
    } else {
      value += toMarkdown(child)
    }
  }
  node.type = 'html'
  node.value = value
}

// src/compile.ts
async function compile(source, { config, filename, preprocessors }) {
  const a = performance.now()
  const remarkPlugins = config?.remarkPlugins ?? []
  const rehypePlugins = config?.rehypePlugins ?? []
  const file = new VFile3({
    value: source,
    path: filename,
    data: {
      remarkPlugins,
      rehypePlugins,
      dependencies: [],
      instance: void 0,
      preprocessors,
      matter: {},
    },
  })
  matter(file, config?.frontmatterParser)
  const data = file.data
  const blueprint = getBlueprintData(file, config)
  if (blueprint) {
    data.dependencies.push(blueprint.path)
    data.blueprint = blueprint
    remarkPlugins.push(...blueprint.remarkPlugins)
    rehypePlugins.push(...blueprint.rehypePlugins)
  }
  const processed = await unified()
    .use(remarkParse)
    .use(remarkCleanSvelte)
    .use(remarkPlugins)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypePlugins)
    .use(rehypeRenderCode)
    .use(rehypeBuildBlueprint)
    .use(rehypeSvelteOverrideComponents)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(file)
  const { code, dependencies } = await preprocess2(
    String(processed),
    preprocessors,
    { filename }
  )
  if (dependencies) data.dependencies.push(...dependencies)
  const ms = new MagicString(code)
  const parsed = parse2(code)
  const module = updateOrCreateSvelteModule(parsed.module, data)
  if (blueprint) {
    let cssContent
    const instance = updateOrCreateSvelteInstance(
      parsed.instance,
      file.path,
      blueprint.path
    )
    if (parsed.instance) {
      ms.remove(parsed.instance.start, parsed.instance.end)
    }
    if (parsed.module) {
      ms.remove(parsed.module.start, parsed.module.end)
    }
    if (parsed.css) {
      cssContent = ms.original.substring(parsed.css.start, parsed.css.end)
      ms.remove(parsed.css.start, parsed.css.end)
    }
    ms.prepend(`<${MDSX_BLUEPRINT_NAME} {metadata}>
`)
    ms.append(`</${MDSX_BLUEPRINT_NAME}>
`)
    if (cssContent) ms.prepend(cssContent)
    ms.prepend(instance.content)
  }
  ms.prepend(module.content)
  logPerf('processMarkdown', a)
  return {
    code: ms.toString(),
    map: ms.generateMap({ source: filename }),
    dependencies: data.dependencies,
  }
}

// src/loadSvelteConfig.ts
import path3 from 'path'
import fs2 from 'fs'
import { createRequire } from 'module'
import { pathToFileURL } from 'url'
var esmRequire
var svelteConfigNames = [
  'svelte.config.js',
  'svelte.config.cjs',
  'svelte.config.mjs',
]
async function dynamicImportDefault(filePath, timestamp) {
  return await import(filePath + '?t=' + timestamp).then((m) => m.default)
}
async function loadSvelteConfig(svelteConfigPath) {
  if (svelteConfigPath === false) {
    return
  }
  const a = performance.now()
  const configFile = findConfigToLoad(svelteConfigPath)
  if (configFile) {
    let err
    if (configFile.endsWith('.js') || configFile.endsWith('.mjs')) {
      try {
        const result = await dynamicImportDefault(
          pathToFileURL(configFile).href,
          fs2.statSync(configFile).mtimeMs
        )
        if (result != null) {
          logPerf('loadSvelteConfig', a)
          return {
            ...result,
            configFile,
          }
        } else {
          throw new Error(`invalid export in ${configFile}`)
        }
      } catch (e) {
        console.error(`failed to import config ${configFile}`, e)
        err = e
      }
    }
    if (!configFile.endsWith('.mjs')) {
      try {
        const _require = import.meta.url
          ? esmRequire ?? (esmRequire = createRequire(import.meta.url))
          : __require
        delete _require.cache[_require.resolve(configFile)]
        const result = _require(configFile)
        if (result != null) {
          logPerf('loadSvelteConfig', a)
          return {
            ...result,
            configFile,
          }
        } else {
          throw new Error(`invalid export in ${configFile}`)
        }
      } catch (e) {
        console.error(`failed to require config ${configFile}`, e)
        if (!err) {
          err = e
        }
      }
    }
    throw err
  }
}
function findConfigToLoad(svelteConfigPath) {
  const a = performance.now()
  const root = process.cwd()
  if (svelteConfigPath) {
    const absolutePath = path3.isAbsolute(svelteConfigPath)
      ? svelteConfigPath
      : path3.resolve(root, svelteConfigPath)
    if (!fs2.existsSync(absolutePath)) {
      throw new Error(`failed to find svelte config file ${absolutePath}.`)
    }
    logPerf('findConfigToLoad', a)
    return absolutePath
  } else {
    const existingKnownConfigFiles = svelteConfigNames
      .map((candidate) => path3.resolve(root, candidate))
      .filter((file) => fs2.existsSync(file))
    if (existingKnownConfigFiles.length === 0) {
      console.debug(`no svelte config found at ${root}`, void 0, 'config')
      return
    } else if (existingKnownConfigFiles.length > 1) {
      console.warn(
        `found more than one svelte config file, using ${existingKnownConfigFiles[0]}. you should only have one!`,
        existingKnownConfigFiles
      )
    }
    logPerf('findConfigToLoad', a)
    return existingKnownConfigFiles[0]
  }
}

// src/defineConfig.ts
function defineConfig(config) {
  return config
}

// src/index.ts
function mdsx(config) {
  return {
    name: 'mdsx',
    async markup({ content, filename }) {
      const exts = config?.extensions ?? ['.md']
      const isValidFile = exts.some((ext) => filename?.endsWith(ext))
      if (!isValidFile) return
      let preprocessors = []
      try {
        const svelteConfig = await loadSvelteConfig(config?.svelteConfigPath)
        preprocessors = svelteConfig?.preprocess
          ? Array.isArray(svelteConfig.preprocess)
            ? svelteConfig.preprocess
            : [svelteConfig.preprocess]
          : []
      } catch (e) {
        console.error(e)
      }
      return compile(content, {
        filename,
        config,
        preprocessors: preprocessors.filter((pp) => pp.name !== 'mdsx'),
      })
    },
  }
}
export { compile, defineConfig, mdsx }
//# sourceMappingURL=index.js.map
