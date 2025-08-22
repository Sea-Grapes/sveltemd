<script lang="ts">
  import '../app.css'
  import favicon from '$lib/assets/favicon.svg'
  import ISvelte from '$lib/icons/ISvelte.svelte'

  let { children } = $props()
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>Sveltemd</title>
</svelte:head>

<main class="min-h-screen">
  <nav
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
  </nav>
  {@render children?.()}
</main>

<footer
  class="border-t border-t-zinc-300 px-4 pt-8 pb-9 text-center font-medium text-zinc-500 text-sm leading-relaxed"
>
  <p>
    Design copied from <a
      href="https://vitepress.dev/"
      target="_blank"
      class="text-zinc-600 underline">VitePress</a
    >
  </p>
  <p>Released under the MIT License.</p>
</footer>
