# Designer Portfolio

Single-designer portfolio site. Minimal, monochrome, image-first. Frontend-only build with a content layer shaped for a later Sanity migration.

## Stack

- Next.js 15 (App Router) · React 19 · TypeScript (strict)
- Tailwind CSS v4
- Space Mono via `next/font/google`
- GSAP (ScrollTrigger) for the scroll-driven Blender frame-sequence hero
- Vitest for data-layer tests
- Deploy: Vercel / Cloudflare Pages

## Local development

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck
npm run lint
npm run test
npm run build
```

## Editing content

All content lives under `src/content/`:

- `src/content/site.ts` — designer name, tagline, bio, contact, socials.
- `src/content/projects/<slug>.ts` — one file per project.
- `public/projects/<slug>/*` — project images.

To add a project:

1. Copy an existing `_example-*.ts` file to `<your-slug>.ts`.
2. Drop your images into `public/projects/<your-slug>/`.
3. Update the new file's fields (slug, title, year, categories, images).
4. Import + add it to the array in `src/content/projects/index.ts`.

`[TODO: ...]` placeholders flag every value that must be replaced before launch.

## Future: CMS migration

The data layer (`src/content/projects/index.ts` + `src/content/site.ts`) is the single seam to swap for a CMS later. Function signatures (`getAllProjects`, `getProjectBySlug`, etc.) and the `Project` / `SiteContent` shapes in `src/content/types.ts` are designed to map 1:1 onto a Sanity schema. See the design spec at `docs/superpowers/specs/2026-05-24-designer-portfolio-design.md`.
