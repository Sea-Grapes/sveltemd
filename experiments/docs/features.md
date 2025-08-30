# Features

This document explains the (theoretical) features that will be provided and how they can be customized.


## Code highlighting

You can either:
1. use the default code options
  1. use the default shiki setup
  2. provide a custom highlighter function
2. write a custom remark/rehype plugin

Default options
```ts
interface CodeOptions {
  highlightInlineCode?: false
  shiki?: {
    // ShikiOptions
    theme: 'dark-plus',
  }
  customHighlighter: Function
}
```

> Todo: evaluate if this is flexible enough. Maybe people dislike this lock-in.