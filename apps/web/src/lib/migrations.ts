import type { Client } from '@libsql/client/web';

interface Migration {
  id: string;
  up: (db: Client) => Promise<void>;
}

const exec = (db: Client, sql: string, args: unknown[] = []) =>
  db.execute({ sql, args: args as any[] });

async function addColumnIfMissing(
  db: Client,
  table: string,
  column: string,
  definition: string
): Promise<void> {
  const info = await db.execute(`PRAGMA table_info(${table})`);
  const exists = info.rows.some(
    (row) => (row as unknown as { name?: string }).name === column
  );
  if (!exists) {
    await exec(db, `ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

const MIGRATIONS: Migration[] = [
  {
    id: '0001_init',
    async up(db) {
      await exec(
        db,
        `CREATE TABLE IF NOT EXISTS users (
           id INTEGER PRIMARY KEY AUTOINCREMENT,
           github_id INTEGER NOT NULL UNIQUE,
           username TEXT NOT NULL,
           email TEXT,
           avatar_url TEXT,
           role TEXT NOT NULL DEFAULT 'developer',
           created_at DATETIME DEFAULT CURRENT_TIMESTAMP
         )`
      );

      await exec(
        db,
        `CREATE TABLE IF NOT EXISTS repos (
           id INTEGER PRIMARY KEY AUTOINCREMENT,
           installation_id INTEGER,
           owner TEXT,
           name TEXT,
           full_name TEXT UNIQUE,
           url TEXT,
           default_branch TEXT,
           index_status TEXT NOT NULL DEFAULT 'pending',
           indexed_at DATETIME,
           created_at DATETIME DEFAULT CURRENT_TIMESTAMP
         )`
      );

      await exec(
        db,
        `CREATE TABLE IF NOT EXISTS installations (
           id INTEGER PRIMARY KEY AUTOINCREMENT,
           installation_id INTEGER NOT NULL UNIQUE,
           account_login TEXT,
           account_type TEXT,
           repository_count INTEGER DEFAULT 0,
           setup_action TEXT,
           created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
           updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
         )`
      );

      // Legacy deployments created `analyses` without head_sha via inline DDL;
      // CREATE TABLE IF NOT EXISTS is skipped there, so add the column after.
      await exec(
        db,
        `CREATE TABLE IF NOT EXISTS analyses (
           id INTEGER PRIMARY KEY AUTOINCREMENT,
           repo_id INTEGER,
           repo_full_name TEXT,
           pr_number INTEGER NOT NULL,
           pr_url TEXT NOT NULL,
           pr_title TEXT,
           pr_author TEXT,
           risk_score INTEGER NOT NULL,
           risk_level TEXT NOT NULL,
           changed_files TEXT,
           changed_symbols TEXT,
           impacted_services TEXT,
           blast_radius TEXT,
           recommendations TEXT,
           head_sha TEXT,
           created_at DATETIME DEFAULT CURRENT_TIMESTAMP
         )`
      );
      await addColumnIfMissing(db, 'analyses', 'head_sha', 'TEXT');
      await exec(
        db,
        `CREATE UNIQUE INDEX IF NOT EXISTS idx_analyses_repo_pr_head
           ON analyses(repo_full_name, pr_number, head_sha)`
      );

      await exec(
        db,
        `CREATE TABLE IF NOT EXISTS webhook_deliveries (
           delivery_id TEXT PRIMARY KEY,
           event TEXT,
           status TEXT NOT NULL DEFAULT 'processing',
           attempts INTEGER NOT NULL DEFAULT 1,
           last_error TEXT,
           received_at DATETIME DEFAULT CURRENT_TIMESTAMP,
           completed_at DATETIME
         )`
      );
    },
  },
];

export async function applyMigrations(db: Client): Promise<void> {
  await exec(
    db,
    `CREATE TABLE IF NOT EXISTS schema_migrations (
       id TEXT PRIMARY KEY,
       applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
     )`
  );

  const applied = await db.execute('SELECT id FROM schema_migrations');
  const done = new Set(
    applied.rows.map((row) => String((row as unknown as { id: string }).id))
  );

  for (const migration of MIGRATIONS) {
    if (done.has(migration.id)) continue;
    await migration.up(db);
    // OR IGNORE: a concurrent cold start may have recorded it first.
    await exec(db, 'INSERT OR IGNORE INTO schema_migrations (id) VALUES (?)', [migration.id]);
  }
}
