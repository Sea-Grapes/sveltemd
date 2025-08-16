<script lang="ts">
  import './app.css'
  import './vars.css'
  import favicon from '$lib/assets/favicon.svg'
  import { page } from '$app/state'
  import { fade } from 'svelte/transition'

  let { children } = $props()
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>Test App</title>
</svelte:head>

<div>
  <nav>
    <a href="/">home</a>
    <a href="/blog">blog</a>
  </nav>
  {#key page.url}
    <main in:fade>
      {@render children?.()}
    </main>
  {/key}
</div>

<style>
  div {
    display: block;
    min-height: 100vh;
  }

  nav {
    display: flex;
    gap: 2rem;
    max-width: var(--screen-xl);
    padding: 1.5rem;
    margin: 0 auto;
  }

  :global(main a) {
    text-decoration: var(--main) underline;
  }
</style>
