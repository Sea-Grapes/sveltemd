import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/index.ts', './src/data.svelte.ts'],
  platform: 'node',
  dts: {
    oxc: true,
  },
  sourcemap: true,
  unbundle: true,
})
