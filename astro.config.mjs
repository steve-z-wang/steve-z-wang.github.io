import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://steve-z-wang.github.io',
  base: '/',
  integrations: [mdx()],
  vite: {
    plugins: [tailwindcss()],
  },
});
