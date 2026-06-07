# Designer Portfolio

Single-designer portfolio site. Minimal, monochrome, image-first. Frontend-only build with a content layer shaped for a later Sanity migration.

## Stack

- Next.js 15 (App Router) · React 19 · TypeScript (strict)
- Tailwind CSS v4
- Inter via `next/font/google`
- Vitest for data-layer tests
- Deploy: Vercel

## Local development

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck
npm run lint
npm run test
npm run build
```

## Editing content (admin CMS)

Content is edited through the admin at `/admin` — no code changes or redeploys needed.

1. Go to `/admin` and enter an authorized email (set in `ADMIN_EMAILS`). A one-time sign-in link is emailed (via Resend). In **local dev with no `RESEND_API_KEY`, the link is printed to the dev-server console** — open it to sign in.
2. Edit each surface:
   - **Work / Art** — drag tiles to arrange, set width/height (in grid cells) in the inspector, upload a cover, edit title/year/slug/categories/summary. Click **Save layout** / **Save details**.
   - **About / Connect** — fill the forms (bio, clients, press; email, socials, "Currently" rows). Click **Save draft**.
3. Edits are private drafts. Click **Publish** (top bar) to make them live. The "Unpublished changes" badge shows when drafts differ from what's published.

### Database setup (first run / local)

```bash
npm run db:migrate   # apply the Drizzle migration
npm run db:seed      # load seed content + write the first published snapshot
```

Requires `DATABASE_URL` (Neon) in `.env.local`. See `.env.example` for all variables. Image uploads need `BLOB_READ_WRITE_TOKEN` in production; locally they fall back to `public/uploads/`.

## Architecture: the published-snapshot seam

The public site never reads the working tables — it reads one cached `published_snapshot` row. **Publish** serializes the working tables into that snapshot and revalidates the cache. The public data accessors (`getAllProjects`, `getProjectBySlug`, `getSiteContent`, …) in `src/content/live.ts` and the `Project` / `SiteContent` shapes in `src/content/types.ts` are the seam. See the admin spec at `docs/superpowers/specs/2026-05-30-designer-portfolio-self-edit-admin.md` and the plan at `docs/superpowers/plans/2026-05-31-designer-portfolio-admin-cms.md`.
