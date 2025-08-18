<script>
  import IMemo from '$lib/icons/IMemo.svelte'
  import IRocket from '$lib/icons/IRocket.svelte'
  import ISvelte from '$lib/icons/ISvelte.svelte'
  import IVite from '$lib/icons/IVite.svelte'
</script>

<section class="max-w-7xl mx-auto py-16-24 px-1-5 space-y-16">
  <div class="flex *:grow items-center">
    <div class="space-y-8">
      <div class="space-y-4">
        <h1
          class="text-5xl font-bold tracking-tight max-w-[18ch] bg-linear-45 from-purple-500 to-blue-500 text-transparent bg-clip-text inline-block"
        >
          Sveltemd Docs
        </h1>
        <h1
          class="text-5xl font-bold tracking-tight text-zinc-700 block max-w-[18ch]"
        >
          Powered by SvelteKit and Sveltemd
        </h1>
        <h2 class="text-2xl text-zinc-500 font-medium">
          Markdown to Beautiful Docs in Minutes
        </h2>
      </div>
      <div
        class="cta flex gap-2 *:px-4 *:py-2 *:rounded-full font-medium text-zinc-700"
      >
        <a
          href="/"
          class="bg-indigo-400 text-white transition-colors hover:bg-indigo-500"
        >
          What is Sveltemd?
        </a>
        <a href="/" class="bg-zinc-100 hover:bg-zinc-200 transition-colors"
          >Quickstart</a
        >
        <a
          href="/"
          class="bg-zinc-100 hover:bg-zinc-200 transition-colors cursor-pointer"
          >Github</a
        >
      </div>
    </div>
    <div class="grid place-content-center relative">
      <div class="absolute inset-0 flex items-center justify-center">
        <div
          class="h-80 w-80 rounded-full bg-[linear-gradient(-45deg,var(--color-purple-500)_50%,var(--color-cyan-500)_50%)] blur-3xl"
        ></div>
      </div>

      <img class="relative block h-80" src="vite_logo.svg" alt="" />
    </div>
  </div>
  <div class="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
    <card>
      <div>
        <IMemo />
      </div>
      <h1>Focus on your content</h1>
      <p>
        Effortlessly create beautiful documentation sites with just markdown.
      </p>
    </card>
    <card>
      <div>
        <IVite />
      </div>
      <h1>Enjoy the Vite DX</h1>
      <p>
        Instant server start, lightning fast hot updates, and leverage Vite
        ecosystem plugins.
      </p>
    </card>
    <card>
      <div>
        <ISvelte />
      </div>
      <h1>Customize with Svelte</h1>
      <p>
        Use Svelte syntax and components directly in markdown, or build custom
        themes with Svelte.
      </p>
    </card>
    <card>
      <div>
        <IRocket />
      </div>
      <h1>Ship Fast Sites</h1>
      <p>
        Fast initial load with static HTML, fast post-load navigation with
        client-side routing.
      </p>
    </card>
  </div>
</section>

<style>
  @reference 'tailwindcss';

  card {
    @apply bg-zinc-100 rounded-lg p-6 space-y-2;

    > div:first-child {
      @apply bg-zinc-200 rounded-md p-2 inline-block aspect-square;
    }

    > h1 {
      @apply font-medium;
    }

    > p {
      @apply text-sm text-zinc-500 leading-relaxed;
      font-weight: 500;
    }
  }
</style>
