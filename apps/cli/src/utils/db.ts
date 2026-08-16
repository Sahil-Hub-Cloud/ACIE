import Database from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';

const SCHEMA = `
-- Dependency Graph
CREATE TABLE IF NOT EXISTS nodes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  file_path TEXT NOT NULL,
  symbol_name TEXT NOT NULL,
  symbol_kind TEXT NOT NULL,
  line_number INTEGER,
  is_exported BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS edges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_file TEXT NOT NULL,
  target_file TEXT NOT NULL,
  edge_type TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  entry_points TEXT,
  traffic_per_hour INTEGER DEFAULT 0,
  error_rate REAL DEFAULT 0.0,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Analysis Results
CREATE TABLE IF NOT EXISTS analyses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  repo_id INTEGER NOT NULL,
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
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Repositories
CREATE TABLE IF NOT EXISTS repos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  github_id INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL,
  owner TEXT NOT NULL,
  url TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'TypeScript',
  is_monorepo BOOLEAN DEFAULT 0,
  monorepo_tool TEXT,
  last_indexed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Users
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  github_id INTEGER NOT NULL UNIQUE,
  username TEXT NOT NULL,
  email TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'developer',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_nodes_file ON nodes(file_path);
CREATE INDEX IF NOT EXISTS idx_nodes_symbol ON nodes(symbol_name);
CREATE INDEX IF NOT EXISTS idx_edges_source ON edges(source_file);
CREATE INDEX IF NOT EXISTS idx_edges_target ON edges(target_file);
CREATE INDEX IF NOT EXISTS idx_analyses_repo ON analyses(repo_id);
CREATE INDEX IF NOT EXISTS idx_analyses_risk ON analyses(risk_level);
`;

let _db: Database.Database | null = null;

export function getDb(dbPath?: string): Database.Database {
  if (_db) return _db;

  const resolvedPath = dbPath || process.env.DATABASE_PATH || './data/acie.db';
  const dir = path.dirname(resolvedPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  _db = new Database(resolvedPath);
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');
  _db.exec(SCHEMA);

  return _db;
}

export function closeDb(): void {
  if (_db) {
    _db.close();
    _db = null;
  }
}

// Node operations
export const NodeQueries = {
  insertBatch(db: Database.Database, nodes: Array<{
    filePath: string;
    symbolName: string;
    symbolKind: string;
    lineNumber: number | null;
    isExported: boolean;
  }>) {
    const insert = db.prepare(`
      INSERT OR IGNORE INTO nodes (file_path, symbol_name, symbol_kind, line_number, is_exported)
      VALUES (@filePath, @symbolName, @symbolKind, @lineNumber, @isExported)
    `);
    const insertMany = db.transaction((rows: typeof nodes) => {
      for (const row of rows) insert.run(row);
    });
    insertMany(nodes);
  },

  deleteByFile(db: Database.Database, filePath: string) {
    db.prepare('DELETE FROM nodes WHERE file_path = ?').run(filePath);
  },

  getAll(db: Database.Database) {
    return db.prepare('SELECT * FROM nodes').all();
  }
};

// Edge operations
export const EdgeQueries = {
  insertBatch(db: Database.Database, edges: Array<{
    sourceFile: string;
    targetFile: string;
    edgeType: string;
  }>) {
    const insert = db.prepare(`
      INSERT OR IGNORE INTO edges (source_file, target_file, edge_type)
      VALUES (@sourceFile, @targetFile, @edgeType)
    `);
    const insertMany = db.transaction((rows: typeof edges) => {
      for (const row of rows) insert.run(row);
    });
    insertMany(edges);
  },

  deleteByFile(db: Database.Database, filePath: string) {
    db.prepare('DELETE FROM edges WHERE source_file = ?').run(filePath);
  },

  getImportersOf(db: Database.Database, targetFile: string): Array<{ source_file: string }> {
    return db.prepare('SELECT source_file FROM edges WHERE target_file = ?').all(targetFile) as Array<{ source_file: string }>;
  },

  getImportsFrom(db: Database.Database, sourceFile: string): Array<{ target_file: string }> {
    return db.prepare('SELECT target_file FROM edges WHERE source_file = ?').all(sourceFile) as Array<{ target_file: string }>;
  },

  getAll(db: Database.Database) {
    return db.prepare('SELECT * FROM edges').all();
  }
};

// Analysis operations
export const AnalysisQueries = {
  insert(db: Database.Database, data: {
    repoId: number;
    prNumber: number;
    prUrl: string;
    prTitle: string;
    prAuthor: string;
    riskScore: number;
    riskLevel: string;
    changedFiles: object;
    changedSymbols: object;
    impactedServices: object;
    blastRadius: object;
    recommendations: string[];
  }) {
    return db.prepare(`
      INSERT INTO analyses (repo_id, pr_number, pr_url, pr_title, pr_author, risk_score, risk_level,
        changed_files, changed_symbols, impacted_services, blast_radius, recommendations)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.repoId, data.prNumber, data.prUrl, data.prTitle, data.prAuthor,
      data.riskScore, data.riskLevel,
      JSON.stringify(data.changedFiles),
      JSON.stringify(data.changedSymbols),
      JSON.stringify(data.impactedServices),
      JSON.stringify(data.blastRadius),
      JSON.stringify(data.recommendations)
    );
  },

  getRecent(db: Database.Database, limit = 10) {
    return db.prepare('SELECT * FROM analyses ORDER BY created_at DESC LIMIT ?').all(limit);
  },

  getById(db: Database.Database, id: number) {
    return db.prepare('SELECT * FROM analyses WHERE id = ?').get(id);
  }
};
