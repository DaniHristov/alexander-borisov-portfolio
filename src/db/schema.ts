/**
 * Drizzle schema for the self-edit admin (see
 * docs/superpowers/specs/2026-05-30-designer-portfolio-self-edit-admin.md).
 *
 * `projects` + `tiles` + `siteContent` are the WORKING tables the admin
 * mutates. `publishedSnapshot` holds a single frozen JSON payload that the
 * public site reads — the public site never reads the working tables, so
 * visitors never see half-finished edits.
 */

import {
  pgTable,
  uuid,
  text,
  integer,
  real,
  boolean,
  timestamp,
  jsonb,
  smallint,
} from 'drizzle-orm/pg-core';

export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  // 'work' | 'art' — which gallery this entry belongs to
  gallery: text('gallery').notNull(),
  title: text('title').notNull(),
  year: integer('year').notNull(),
  client: text('client'),
  role: text('role'),
  summary: text('summary').notNull().default(''),
  description: text('description'),
  coverBlobUrl: text('cover_blob_url'),
  coverW: integer('cover_w'),
  coverH: integer('cover_h'),
  // Free-canvas placement of this project's COVER, in "design px" on a virtual
  // canvas of width DESIGN_W (see src/lib/grid.ts). x/y may be negative or
  // exceed DESIGN_W for edge-bleed; the tile's height derives from the cover
  // aspect, so only width (w) is stored. z orders overlapping tiles.
  x: real('x').notNull().default(60),
  y: real('y').notNull().default(60),
  w: real('w').notNull().default(520),
  z: integer('z').notNull().default(0),
  // 'cover' — framed photo · 'contain' — transparent PNG floating without a box
  fit: text('fit').notNull().default('cover'),
  // When false the tile is decorative (e.g. a floating logo): shown on the
  // collage but not clickable — it opens no lightbox.
  clickable: boolean('clickable').notNull().default(true),
  // 'draft' | 'published' — working-table editing state
  status: text('status').notNull().default('draft'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// A project's detail-page gallery images, in order. These stack on the detail
// page, so they need no grid coordinates — only sort order.
export const tiles = pgTable('tiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  blobUrl: text('blob_url').notNull(),
  width: integer('width').notNull(),
  height: integer('height').notNull(),
  alt: text('alt').notNull().default(''),
  caption: text('caption'),
  sortOrder: integer('sort_order').notNull().default(0),
});

// Singleton (id is always 1): About + Connect text content.
export const siteContent = pgTable('site_content', {
  id: smallint('id').primaryKey().default(1),
  bio: text('bio').array().notNull().default([]),
  selectedClients: text('selected_clients').array().notNull().default([]),
  press: jsonb('press').notNull().default([]),
  portraitBlobUrl: text('portrait_blob_url'),
  email: text('email').notNull().default(''),
  socials: jsonb('socials').notNull().default([]),
  currently: jsonb('currently').notNull().default([]),
});

// Singleton (id is always 1): the entire public payload frozen at last Publish.
export const publishedSnapshot = pgTable('published_snapshot', {
  id: smallint('id').primaryKey().default(1),
  data: jsonb('data').notNull(),
  publishedAt: timestamp('published_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type ProjectRow = typeof projects.$inferSelect;
export type NewProjectRow = typeof projects.$inferInsert;
export type TileRow = typeof tiles.$inferSelect;
export type NewTileRow = typeof tiles.$inferInsert;
export type SiteContentRow = typeof siteContent.$inferSelect;
export type PublishedSnapshotRow = typeof publishedSnapshot.$inferSelect;
