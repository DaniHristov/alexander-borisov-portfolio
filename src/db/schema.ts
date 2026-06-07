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
  // category keys (see src/content/types.ts Category)
  categories: text('categories').array().notNull().default([]),
  client: text('client'),
  role: text('role'),
  summary: text('summary').notNull().default(''),
  description: text('description'),
  coverBlobUrl: text('cover_blob_url'),
  coverW: integer('cover_w'),
  coverH: integer('cover_h'),
  // Snap-grid placement of this project's COVER on the gallery page,
  // measured in grid CELLS (not pixels). This is what the editor arranges.
  col: smallint('col').notNull().default(0),
  row: smallint('row').notNull().default(0),
  colSpan: smallint('col_span').notNull().default(1),
  rowSpan: smallint('row_span').notNull().default(1),
  z: integer('z').notNull().default(0),
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
