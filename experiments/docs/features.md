# Features

This document explains the (theoretical) features that will be provided and how they can be customized.


## Code highlighting

You can either:
1. use the default highlighting unified plugin
  1. use the default shiki setup
  2. provide a custom highlighter function
2. write a custom remark/rehype plugin

Default usage
```ts
const config = {
  code: defaultHighlighter()
}

const config = {
  code: defaultHighlighter({
    highlightInlineCode: true,
    theme: 'dark-plus',
  })
}

// or you can do this if you really want
const config = {
  remarkPlugins: [defaultHighlighter({})]
}

const config = {
  code: async function({ code, lang, meta}) {

  }
}

const config = {
  // basically generates a remark plugin
  code: defaultHighlighter({
    highlightInlineCode: true,
    highlighter: async function({}) {}
  })
}

const config = {
  code: shikiHighlighter({
    highlightInlineCode: true,
    theme: 'dark-plus'
  })
}
```

> Todo: evaluate if this is flexible enough. Maybe people dislike this lock-in.