<script lang="ts">

  import '../app.css'
  import favicon from '$lib/assets/favicon.svg'
  import ISvelte from '$lib/icons/ISvelte.svelte'
  import { scrollY } from 'svelte/reactivity/window'
  import { page } from '$app/state'

  let { children } = $props()
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>Sveltemd</title>
</svelte:head>

<main class="min-h-screen">
  <nav
    class="{page.url.pathname !== '/' || (scrollY.current && scrollY.current > 10)
      ? 'bg-white/80 border-b backdrop-blur-lg'
      : ''} sticky border-zinc-300 top-0 transition-colors z-10"
  >
    <div
      class="py-4 px-4 sm:px-6 xl:px-8 flex justify-between font-medium items-center max-w-8xl mx-auto"
    >
      <a href="/" class="text-lg flex gap-2 items-center">
        <ISvelte />
        Sveltemd</a
      >
      <div class="flex gap-8 text-[15px] text-zinc-600">
        <a href="/docs">Docs</a>
        <a href="/docs">Reference</a>
      </div>
    </div>
  </nav>
  {@render children?.()}
</main>
