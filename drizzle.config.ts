import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// drizzle-kit only auto-loads `.env`, not `.env.local`. Load it explicitly so
// DATABASE_URL is available to the migrate/generate/studio commands.
config({ path: '.env.local' });


// Generates SQL migrations from src/db/schema.ts into ./drizzle.
// Run: npm run db:generate (create migration) / npm run db:migrate (apply).
export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
