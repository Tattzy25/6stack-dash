import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set. Please configure ops-dashboard/.env.local');
}

const sql = neon(databaseUrl);

export { sql };
