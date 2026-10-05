import { createClient, Client } from '@libsql/client/web';
import { applyMigrations } from './migrations';

let db: Client | null = null;

if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
  db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
} else if (process.env.NODE_ENV !== 'production' && process.env.TURSO_DATABASE_URL) {
    db = createClient({
        url: process.env.TURSO_DATABASE_URL
    });
}

// Run migrations once per process, before the first query.
let schemaReady: Promise<void> | null = null;

async function ready(): Promise<Client | null> {
  if (!db) return null;
  if (!schemaReady) {
    schemaReady = applyMigrations(db).catch((error) => {
      schemaReady = null; // allow the next query to retry
      console.error('[ACIE] Database migration failed:', error);
      throw error;
    });
  }
  await schemaReady;
  return db;
}

export const getDb = () => {
  return db;
};

export const run = async (sql: string, args: any[] = []) => {
    const client = await ready();
    if(!client) return { rows: [], rowsAffected: 0, lastInsertRowid: undefined };
    return client.execute({ sql, args });
}

export const all = async <T = any>(sql: string, args: any[] = []): Promise<T[]> => {
    const client = await ready();
    if(!client) return [];
    const result = await client.execute({ sql, args });
    return result.rows as unknown as T[];
}

export const get = async <T = any>(sql: string, args: any[] = []): Promise<T | undefined> => {
    const client = await ready();
    if(!client) return undefined;
    const result = await client.execute({ sql, args });
    return result.rows[0] as unknown as T | undefined;
}
