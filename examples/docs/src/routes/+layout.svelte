<script lang="ts">
  import '../app.css'
  import favicon from '$lib/assets/favicon.svg'

  let { children } = $props()
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<nav
  class="py-4 px-4 sm:px-6 xl:px-8 2xl:px-40 flex justify-between font-medium items-center"
>
  <a href="/" class="text-lg">Sveltemd</a>
  <div class="flex gap-8 text-[15px] text-zinc-600">
    <a href="/docs">Docs</a>
    <a href="/docs">Reference</a>
  </div>
</nav>
{@render children?.()}
