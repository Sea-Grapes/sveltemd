---
title: 'Svelte 5 Stress Test'
author: 'Test Author'
tags: ['svelte', 'markdown', 'test']
published: true
date: '2025-08-10'
---

<script>
  import { mount, unmount } from 'svelte'
  import MyComponent from './MyComponent.svelte'
  
  let count = $state(0)
  let items = $state(['apple', 'banana', 'cherry'])
  let user = $state({ name: 'John', age: 30 })
  let showModal = $state(false)
  
  const doubled = $derived(count * 2)
  const isEven = $derived.by(() => count % 2 === 0)
  
  $effect(() => {
    console.log(`Count changed to: ${count}`)
  })
  
  function addItem() {
    items.push(`Item ${items.length + 1}`)
  }
</script>

# Main Heading

This is a **markdown paragraph** with _italic text_ and [a link](https://example.com).

## Svelte 5 Runes Testing

### State and Derived

Current count: {count} (doubled: {doubled})
<button onclick={() => count++}>Increment Count</button>

The count is {isEven ? 'even' : 'odd'}.

### Conditional Rendering

### Each Blocks with Markdown

{#each items as item, index}
{index + 1}. **{item}** - This item is _{item.length}_ characters long.

> This is a blockquote inside an each block.
{/each}

<button onclick={addItem}>Add Item</button>

### Nested Logic

{#if user}
{#each items as item}
{#if item.includes('a')} - `{item}` contains the letter **a**

      ```javascript
      const hasA = item.includes('a')
      console.log(hasA)
      ```
    {/if}

{/each}
{/if}

### Await Blocks

{#await fetch('/api/data')}

## Loading...

_Please wait while we fetch your data._
{:then response}

## Success!

Data loaded: **{response.status}**
{:catch error}

## Error

Something went wrong: `{error.message}`
{/await}

### Key Blocks

{#key count}
This content re-renders when count changes: **{count}**

```json
{
  "count": {count},
  "doubled": {doubled}
}
```

{/key}

### Event Handlers and Complex Expressions

<div class="interactive-section">
  
  ## Interactive Section
  
  <button onclick={() => {
    count += 5
    console.log('Added 5!')
  }}>
    Add 5
  </button>
  
  <input 
    bind:value={user.name} 
    placeholder="Enter your name"
  />
  
  Hello **{user.name}**! You are {user.age} years old.
  
</div>

### Snippets (Svelte 5)

{#snippet greeting(name)}

## Hello, {name}!

Welcome to our **markdown** document.
{/snippet}

{@render greeting('Alice')}
{@render greeting('Bob')}

### HTML in Markdown

Here's some regular markdown with embedded HTML:

<details>
  <summary>Click to expand</summary>
  
  ## Hidden Content
  
  This markdown content is *inside* an HTML details element.
  
  - List item 1
  - List item 2
  
  ```typescript
  const example = 'code block inside HTML'
  ```
  
</details>

### Complex Interpolations

The total character count is: {items.reduce((acc, item) => acc + item.length, 0)}

Items starting with vowels: {items.filter(item => /^[aeiou]/i.test(item)).join(', ')}

### Reactive Classes and Styles

<div class:highlight={count > 10} style:color={count > 5 ? 'red' : 'blue'}>
  This div changes **appearance** based on count: {count}
</div>

### Component Usage

<MyComponent
title="Test Component"
{count}
items={items.slice(0, 2)}
/>

## Final Section

This tests **all major Svelte 5 features** mixed with markdown:

1. **Runes**: `$state`, `$derived`, `$effect`
2. **Logic blocks**: `{#if}`, `{#each}`, `{#await}`, `{#key}`
3. **Interpolations**: Simple and complex expressions
4. **Event handlers**: `onclick`, `bind:value`
5. **Snippets**: `{#snippet}` and `{@render}`
6. **Reactive attributes**: `class:`, `style:`
7. **Components**: Custom component usage
8. **HTML mixing**: Native HTML elements with Svelte features

_End of stress test!_
