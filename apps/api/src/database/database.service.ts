import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Database from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private db: Database.Database;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const dbPath = this.configService.get<string>('DATABASE_PATH') || './data/acie.db';
    const resolvedPath = path.resolve(dbPath);
    const dir = path.dirname(resolvedPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.db = new Database(resolvedPath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');

    // Create tables if they do not exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        github_id INTEGER NOT NULL UNIQUE,
        username TEXT NOT NULL,
        email TEXT,
        avatar_url TEXT,
        role TEXT DEFAULT 'developer',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS repos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        github_id INTEGER NOT NULL UNIQUE,
        name TEXT NOT NULL,
        owner TEXT NOT NULL,
        url TEXT NOT NULL,
        language TEXT NOT NULL,
        is_monorepo BOOLEAN DEFAULT 0,
        monorepo_tool TEXT,
        last_indexed_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

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

      CREATE TABLE IF NOT EXISTS analyses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        repo_id INTEGER NOT NULL,
        pr_number INTEGER NOT NULL,
        pr_url TEXT NOT NULL,
        risk_score INTEGER NOT NULL,
        risk_level TEXT NOT NULL,
        changed_files TEXT,
        impacted_services TEXT,
        blast_radius TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (repo_id) REFERENCES repos(id)
      );

      CREATE INDEX IF NOT EXISTS idx_nodes_file ON nodes(file_path);
      CREATE INDEX IF NOT EXISTS idx_nodes_symbol ON nodes(symbol_name);
      CREATE INDEX IF NOT EXISTS idx_edges_source ON edges(source_file);
      CREATE INDEX IF NOT EXISTS idx_edges_target ON edges(target_file);
      CREATE INDEX IF NOT EXISTS idx_analyses_repo ON analyses(repo_id);
      CREATE INDEX IF NOT EXISTS idx_analyses_risk ON analyses(risk_level);
    `);
  }

  onModuleDestroy() {
    if (this.db) {
      this.db.close();
    }
  }

  getDb(): Database.Database {
    return this.db;
  }

  run(sql: string, ...params: any[]): Database.RunResult {
    return this.db.prepare(sql).run(...params);
  }

  all<T = any>(sql: string, ...params: any[]): T[] {
    return this.db.prepare(sql).all(...params) as T[];
  }

  get<T = any>(sql: string, ...params: any[]): T | undefined {
    return this.db.prepare(sql).get(...params) as T | undefined;
  }
}
