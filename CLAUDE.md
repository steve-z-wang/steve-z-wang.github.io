# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal blog built with Astro 5, a static site generator. The site is deployed to GitHub Pages at https://steve-z-wang.github.io/. Posts are written in Markdown and stored in the `/posts` directory.

## Commands

```bash
npm run dev      # Start dev server with hot reload
npm run build    # Production build to dist/
npm run preview  # Preview production build locally
```

## Architecture

**Content System:**
- Blog posts live in `/posts/` as Markdown files with frontmatter
- Content schema defined in `src/content.config.ts` using Astro Content Collections
- Required frontmatter: `title`, `summary`, `publishedAt`
- Optional frontmatter: `tags[]`, `cover`, `draft`

**Routing:**
- File-based routing in `src/pages/`
- Dynamic routes use `getStaticPaths()` for static generation: `posts/[slug].astro`, `tags/[tag].astro`
- RSS feed generated at `src/pages/rss.xml.ts`

**Styling:**
- Tailwind CSS 4 with typography plugin for prose styling
- Global styles in `src/styles/global.css`
- Dark/light mode toggle persisted to localStorage, applied via `.dark` class on `<html>`
- CSS counters provide automatic heading numbering in articles

**Layout:**
- Single layout wrapper: `src/layouts/BaseLayout.astro`
- View Transitions enabled for smooth page navigation

## Deployment

Automated via GitHub Actions on push to `main` branch. Workflow in `.github/workflows/deploy.yml` builds and deploys to GitHub Pages.
