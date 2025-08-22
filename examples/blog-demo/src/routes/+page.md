<script>
  let count = $state(0)
</script>

<h1 class="text-3xl font-bold tracking-tight">Welcome to the demo site</h1>

this is a **test**

<button onclick={() => { count++ }}>This **button** has been _clicked_ {count} times</button>

This is some test text

&#123;

```js
console.log('test')
```

<style>
  @reference 'tailwindcss';
  button {
    @apply bg-slate-100 hover:bg-slate-200 rounded-md p-1 px-2 cursor-pointer;
  }
</style>
