# Svelte Markdown Stress Test File

This file is designed to stress test a Svelte + Markdown preprocessor with various edge cases and complex combinations.

## Basic Svelte Components in Markdown

<script>
  import { onMount } from 'svelte';
  let count = 0;
  let items = ['apple', 'banana', 'cherry'];
  let showContent = false;
  
  // Edge case: script with markdown-like syntax in comments
  /* 
   * # This looks like markdown but it's a comment
   * - Item 1
   * - Item 2
   */
  onMount(() => {
    console.log('Component mounted');
  });
</script>

### Counter Component Test

Click count: **{count}**

<button onclick={() => count++}>
  Increment by `1` and show **bold** text
</button>

## Nested Markdown in Svelte Logic

{#if showContent}
### Conditional Content

This is a **dynamically** rendered section with:

1. *Italic text* in a list
2. `Code snippets` mixed with variables: `{count}`
3. Links: [Svelte Documentation](https://svelte.dev)

```javascript
// Code block inside conditional
const greeting = `Hello, count is ${count}`;
console.log(greeting);
```

{:else}
*Click the button below to reveal content*
{/if}

<button onclick={() => showContent = !showContent}>
  Toggle Content ({showContent ? 'Hide' : 'Show'})
</button>

## Each Blocks with Markdown

### Fruit List with Mixed Content

{#each items as item, index}
- **Item {index + 1}**: *{item}* 
  
  > This is a blockquote for {item}
  
  ```json
  {
    "fruit": "{item}",
    "index": {index},
    "uppercase": "{item.toUpperCase()}"
  }
  ```
  
  ---
{/each}

## Edge Case: Markdown in Attribute Values

<div title="This has **markdown** that shouldn't render">
  Testing markdown in attributes
</div>

<a href="/path/with/{count}" title="Link with count: {count}">
  Dynamic link with **bold** text and `{count}` interpolation
</a>

## Complex Nesting

{#if count > 5}
### High Count Section

You've clicked **{count}** times! Here's some complex content:

{#each Array(Math.min(count, 3)) as _, i}
#### Subsection {i + 1}

This is dynamically generated content number **{i + 1}**.

```svelte
<!-- Svelte code in markdown in each block -->
<p>Iteration: {i}</p>
<strong>Count: {count}</strong>
```

##### Nested List in Each Block

- Primary item {i + 1}
  - Nested item with *emphasis*
  - Another nested with `code: {count + i}`
    - Triple nested with **bold {item}** text
    - Link in nested list: [Example #{i}](https://example.com/{i})

> Blockquote in each iteration {i + 1}:  
> Current count is **{count}** and item index is `{i}`.
> 
> ```javascript
> const data = {
>   iteration: {i},
>   count: {count},
>   timestamp: Date.now()
> };
> ```

{/each}
{/if}

## Edge Case: Special Characters and Escaping

### Testing Markdown Characters in Svelte

Text with asterisks: {`*not bold*`} vs **actually bold**

Backticks in interpolation: {`\`code\``}

Underscores: {`_not_italic_`} vs _actually italic_

Hash symbols: {`# Not a header`}

### Testing Svelte Syntax in Code Blocks

```svelte
<!-- This should be treated as code, not executed -->
<script>
  let value = "test with *asterisks* and _underscores_";
  $: computed = `# ${value}`;
</script>

{#if condition}
  <p>{value}</p>
{/if}
```

```javascript
// JavaScript with Svelte-like syntax
const template = `
  {#if condition}
    <p>This looks like Svelte but it's a string</p>
  {/if}
`;
```

## Problematic Combinations

### Markdown Tables with Svelte

| Column 1 | Column 2 | Dynamic |
|----------|----------|---------|
| Static   | **Bold** | {count} |
| *Italic* | `Code`   | {items[0]} |
| [Link](/) | Text     | {showContent ? '✓' : '✗'} |

### HTML in Markdown with Svelte

<details open>
  <summary>**Expandable Section** with `{count}` clicks</summary>
  
  This combines:
  - HTML `<details>` element
  - **Markdown** formatting in summary
  - Svelte interpolation `{count}`
  
  {#if count % 2 === 0}
  #### Even Count Content
  
  The count is **even**: {count}
  
  {#each items.slice(0, 2) as item}
  - Processing: *{item}*
  {/each}
  
  {:else}
  #### Odd Count Content
  
  The count is **odd**: {count}
  
  > Blockquote with dynamic content:  
  > Items: {items.join(', ')}
  
  {/if}
</details>

## Advanced Edge Cases

### Comments and Special Blocks

<!-- HTML comment with {interpolation} that shouldn't execute -->

<!-- 
Multi-line comment with:
- Markdown list
- **Bold text**
- {svelte} interpolation
-->

### Escaped Braces and Mixed Syntax

Literal braces: \{not interpolated\}

Mixed: This is {count} but this is \{not interpolated\}

In code spans: `{this should stay as-is}` vs {count}

### Deeply Nested Structures

{#if count > 0}
{#each items as item}
{#if item.length > 5}
### Item: {item}

This item has more than 5 characters!

{#if count > 10}
#### Super High Count!

- Count: **{count}**
- Item: *{item}*
- Combined: `{item}-{count}`

{:else}
*Count is {count}, not high enough yet*
{/if}

{/if}
{/each}
{/if}

## Raw HTML with Svelte

<div class="custom" data-count="{count}">
  <p>Raw HTML paragraph with <strong>nested {item}</strong> content</p>
  
  {#if true}
  <span>Svelte in raw HTML</span>
  {/if}
  
  <pre><code>
  // Code in raw HTML
  const value = {count};
  const items = {JSON.stringify(items)};
  </code></pre>
</div>

## Stress Test: Everything Combined

{#each items as item, i}
{#if i % 2 === 0}

### Even Index Item: {item}

<details>
<summary>Click to expand details for **{item}** (index: {i})</summary>

#### Content for {item}

This section combines:

1. **Each block** iteration {i + 1}
2. *Conditional* rendering 
3. `Dynamic` content: {item.toUpperCase()}

| Property | Value | Type |
|----------|-------|------|
| Item | {item} | String |
| Index | {i} | Number |
| Length | {item.length} | Number |
| Count | {count} | Number |

```json
{
  "item": "{item}",
  "index": {i},
  "isEven": true,
  "count": {count}
}
```

> **Quote for {item}:**  
> This is item number {i + 1} out of {items.length}.  
> Current click count: {count}

{#if count > i * 3}
##### Bonus Section for {item}

You've clicked enough times ({count}) to unlock this section!

- Bonus content for **{item}**
- Math: {count} > {i * 3} ✓
- Uppercase: `{item.toUpperCase()}`

{/if}

</details>

{:else}

### Odd Index Item: {item}

Simple content for **{item}** at index {i}.

- Just basic *markdown* here
- With some `{item}` interpolation
- And a [link to nowhere](#)

{/if}

---

{/each}

## Final Edge Cases

### Multiple Scripts (Edge Case)

<script context="module">
  // Module script with markdown-like comment
  /* 
   * ## This looks like markdown
   * But it's just a comment in module context
   */
  export const staticData = "test";
</script>

### Style Blocks

<style>
  /* CSS with curly braces that aren't Svelte */
  .test::before {
    content: "{not svelte}";
  }
  
  .dynamic {
    /* This comment has *markdown* that shouldn't process */
    color: red;
  }
</style>

### Malformed/Edge Syntax

Unclosed interpolation: {count

Mismatched blocks:
{#if true}
  {#each items as item}
    Content for {item}
  {/if}
{/each}

Nested same blocks:
{#if true}
  {#if false}
    Nested if
  {/if}
{/if}

### Unicode and Special Characters

Testing unicode: 🚀 **{count}** ✨

Emoji in interpolation: {count > 0 ? '🎉' : '😴'}

Special markdown chars: \*not bold\* \_not italic\_

---

## Summary

This file tests:
- ✅ Basic Svelte-Markdown integration
- ✅ Nested control structures  
- ✅ Complex interpolations
- ✅ Mixed HTML/Markdown/Svelte
- ✅ Edge cases with special characters
- ✅ Deeply nested combinations
- ✅ Tables with dynamic content
- ✅ Code blocks with various syntaxes
- ✅ Comments and escaping
- ✅ Malformed syntax scenarios

**Final count: {count}** | **Items: {items.length}** | **Show content: {showContent ? 'Yes' : 'No'}**