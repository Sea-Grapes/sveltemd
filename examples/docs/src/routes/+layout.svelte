<script lang="ts">
  import '../app.css'
  import favicon from '$lib/assets/favicon.svg'

  let { children } = $props()
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<nav class="p-4 flex justify-between">
  <a href="/">Sveltemd</a>
</nav>
{@render children?.()}
