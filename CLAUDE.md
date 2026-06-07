# Designer Portfolio — Client Folder

Single-designer portfolio website. Image-first, monochrome, minimal — modeled on yutakawaguchi.com. Now backed by a self-edit admin CMS (Neon + Vercel Blob).

## Status

- [x] Spec (design): `docs/superpowers/specs/2026-05-24-designer-portfolio-design.md`
- [x] Spec (admin CMS): `docs/superpowers/specs/2026-05-30-designer-portfolio-self-edit-admin.md`
- [x] Plan (admin CMS): `docs/superpowers/plans/2026-05-31-designer-portfolio-admin-cms.md`
- [x] Admin CMS: magic-link auth, snap-grid Work/Art editors, About/Connect forms, Publish
- [ ] Real content (designer uploads via `/admin`, then Publish)
- [ ] Folder rename to the designer's slug
- [ ] Provision Vercel Blob + Resend, deploy + domain (see plan "Deploy notes")

## Tech stack

Next.js 15 + React 19 + TypeScript + Tailwind v4. Backend: Neon Postgres via Drizzle; images on Vercel Blob; magic-link email via Resend; drag via `@dnd-kit`. See README.md for local-dev commands.

## Canonical public routes

`/`, `/work`, `/work/[slug]`, `/art`, `/about`, `/connect`. (The old `/works` and `/contact` duplicates were removed.)

## Admin CMS (`/admin`)

- **Auth:** magic-link. Enter an email on `/admin/login`; only addresses in `ADMIN_EMAILS` get a one-time signed link. In local dev (no `RESEND_API_KEY`) the link is printed to the dev-server console. Session is a signed httpOnly cookie. Every `/admin` page and write action verifies the session server-side.
- **Editors:** Work + Art are snap-grid editors (drag to move, W/H span inputs to resize, inspector for cover upload + metadata). About + Connect are simple forms.
- **Draft → Publish:** edits write to working tables and are private. **Publish** serializes a snapshot the public site reads (cached, `revalidateTag('published')`). The top bar shows an "Unpublished changes" badge whenever the working content differs from the published snapshot.
- **Uploads:** Vercel Blob when `BLOB_READ_WRITE_TOKEN` is set; otherwise a local dev fallback writes to `public/uploads/` (gitignored).

## Folder guide

- `src/app/` — App Router routes; `src/app/admin/` is the CMS (login, callback, `(editor)` group).
- `src/components/` — public UI; `src/components/admin/` — editor UI.
- `src/db/` — Drizzle schema, client, snapshot builder, admin queries + publish.
- `src/lib/` — `auth/` (tokens, session, allow-list), `email/`, `storage/` (uploads), `grid.ts`.
- `src/content/` — public data layer seam (`live.ts` reads the snapshot; `site.ts`/`art.ts` are seed data + types).
- `scripts/seed.mts` — seeds the DB from the seed content; rewrites the published snapshot.
- `tests/` — Vitest unit tests (auth tokens, allow-list, grid helpers, upload validation, snapshot diff).

## Env vars

See `.env.example`. `DATABASE_URL`, `ADMIN_EMAILS`, `AUTH_SECRET` are required for the admin to work; `BLOB_READ_WRITE_TOKEN` and `RESEND_API_KEY` are optional in dev (fallbacks apply) and required in production.

## Open items

1. **Real content.** The designer signs in at `/admin`, uploads work/art images, edits About/Connect, and clicks Publish. Seed copy/identity ("Alexander Borisov") and images are still placeholders.
2. **Provisioning + deploy.** Provision Vercel Blob + Resend (verified sender) and deploy. See the plan's "Deploy notes".
3. **Folder/domain.** Rename the client folder to the designer's slug; set the domain.
