<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Blog Demo</title>
</svelte:head>

<nav class="flex content-between gap-8 p-8">
	<a href="/">home</a>
	<a href="/blog">blog</a>
</nav>
<main class="mx-auto max-w-7xl p-8">
	{@render children?.()}
</main>
