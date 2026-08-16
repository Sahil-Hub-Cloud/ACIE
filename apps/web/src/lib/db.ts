import { createClient, Client } from '@libsql/client/web';

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

export const getDb = () => {
  return db;
};

export const run = async (sql: string, args: any[] = []) => {
    if(!db) return { rows: [], rowsAffected: 0, lastInsertRowid: undefined };
    return db.execute({ sql, args });
}

export const all = async <T = any>(sql: string, args: any[] = []): Promise<T[]> => {
    if(!db) return [];
    const result = await db.execute({ sql, args });
    return result.rows as unknown as T[];
}

export const get = async <T = any>(sql: string, args: any[] = []): Promise<T | undefined> => {
    if(!db) return undefined;
    const result = await db.execute({ sql, args });
    return result.rows[0] as unknown as T | undefined;
}
