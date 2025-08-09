<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
  <title>Test App</title>
</svelte:head>

<div>
  <nav>
    <a href='/'>home</a>
  </nav>
  <main>
    {@render children?.()}
  </main>
</div>