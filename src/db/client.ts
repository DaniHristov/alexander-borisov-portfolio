/**
 * Neon serverless Postgres client wired to Drizzle.
 *
 * `DATABASE_URL` is provisioned by the Vercel → Neon integration. Until it is
 * set (e.g. local dev before provisioning), importing this module does not
 * throw — the error is deferred to first query so the rest of the app (and
 * `next build`) still works. The public data layer catches that and falls back
 * to seed content.
 */

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

function makeDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL is not set. Provision Neon via the Vercel integration and add it to .env.local.',
    );
  }
  const sql = neon(url);
  return drizzle(sql, { schema });
}

// Lazy singleton: only constructs the client when a query is actually run.
let _db: ReturnType<typeof makeDb> | null = null;

export function getDb() {
  if (!_db) _db = makeDb();
  return _db;
}

export { schema };
