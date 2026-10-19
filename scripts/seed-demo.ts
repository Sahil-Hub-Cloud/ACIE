#!/usr/bin/env node
/**
 * Demo seed script — populates a local database with realistic analysis data
 * so the dashboard looks alive during development.
 * 
 * Usage: pnpm --filter @acie/web tsx scripts/seed-demo.ts
 *        (or run via the web dev server and visit /api/dev/seed)
 */

import { createClient } from '@libsql/client';
import crypto from 'crypto';

const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL || 'file:./data/seed.db';
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN || '';

const db = createClient({ url: TURSO_DATABASE_URL, authToken: TURSO_AUTH_TOKEN });

const SAMPLE_REPOS = [
  { owner: 'acme', name: 'widgets', full_name: 'acme/widgets', lang: 'TypeScript', tool: 'pnpm' },
  { owner: 'acme', name: 'payments', full_name: 'acme/payments', lang: 'TypeScript', tool: 'turbo' },
  { owner: 'beta-corp', name: 'api', full_name: 'beta-corp/api', lang: 'TypeScript', tool: 'nx' },
];

const SAMPLE_ANALYSES = [
  {
    repo: 'acme/widgets',
    pr: 42,
    title: 'Refactor authentication middleware',
    author: 'alice-dev',
    score: 87,
    level: 'critical',
    files: ['src/auth/middleware.ts', 'src/auth/tokens.ts'],
    symbols: ['verifyToken', 'refreshToken', 'AuthContext'],
    services: ['auth', 'api'],
    eps: ['src/auth/middleware.ts'],
  },
  {
    repo: 'acme/widgets',
    pr: 41,
    title: 'Add pagination to user list endpoint',
    author: 'bob-dev',
    score: 23,
    level: 'low',
    files: ['src/api/users/list.ts'],
    symbols: ['listUsers'],
    services: ['api'],
    eps: ['src/api/users/list.ts'],
  },
  {
    repo: 'acme/payments',
    pr: 17,
    title: 'Fix currency conversion rounding',
    author: 'carol-dev',
    score: 64,
    level: 'high',
    files: ['src/services/currency.ts', 'src/services/exchange.ts'],
    symbols: ['convertCurrency', 'fetchRates', 'roundAmount'],
    services: ['payments', 'billing'],
    eps: ['src/api/payments/charge.ts'],
  },
  {
    repo: 'beta-corp/api',
    pr: 88,
    title: 'Migrate to new logging framework',
    author: 'dave-dev',
    score: 45,
    level: 'medium',
    files: ['src/logger/index.ts', 'src/logger/transports.ts'],
    symbols: ['createLogger', 'LogLevel', 'Transport'],
    services: ['core', 'monitoring'],
    eps: [],
  },
];

async function seed() {
  console.log('🌱 Seeding demo data...');

  // Create tables if needed (schema from migrations)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      github_id INTEGER UNIQUE NOT NULL,
      username TEXT NOT NULL,
      email TEXT,
      avatar_url TEXT,
      role TEXT DEFAULT 'developer',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS installations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      installation_id INTEGER UNIQUE NOT NULL,
      account_login TEXT,
      account_type TEXT,
      repository_count INTEGER DEFAULT 0,
      setup_action TEXT,
      setup_user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS repos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      installation_id INTEGER,
      owner TEXT NOT NULL,
      name TEXT NOT NULL,
      full_name TEXT UNIQUE NOT NULL,
      url TEXT,
      language TEXT DEFAULT 'TypeScript',
      is_monorepo INTEGER DEFAULT 0,
      monorepo_tool TEXT,
      indexed_at DATETIME,
      created_by_user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS analyses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      repo_id INTEGER,
      repo_full_name TEXT NOT NULL,
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
      pr_updated_at TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed a demo user
  const demoUser = await db.execute({
    sql: `INSERT OR IGNORE INTO users (github_id, username, email, role) VALUES (999999, 'demo-user', 'demo@acie.local', 'developer') RETURNING id`,
  });
  const userId = demoUser.rows[0]?.id ?? 1;
  console.log(`👤 Demo user ID: ${userId}`);

  // Seed installations and repos
  for (const repo of SAMPLE_REPOS) {
    // Create installation for each owner if not exists
    const installId = await db.execute({
      sql: `INSERT OR IGNORE INTO installations (installation_id, account_login, account_type, repository_count, setup_user_id) 
            VALUES (?, ?, 'Organization', 1, ?) RETURNING id`,
      args: [crypto.randomUUID().replace(/-/g, '').slice(0, 10), repo.owner, userId],
    });
    
    const installationId = installId.rows[0]?.id ?? 
      (await db.execute({ sql: 'SELECT id FROM installations WHERE account_login = ?', args: [repo.owner] })).rows[0]?.id;

    // Create repo
    await db.execute({
      sql: `INSERT OR IGNORE INTO repos (installation_id, owner, name, full_name, url, language, is_monorepo, monorepo_tool, created_by_user_id, indexed_at)
            VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, CURRENT_TIMESTAMP)`,
      args: [installationId, repo.owner, repo.name, repo.full_name, `https://github.com/${repo.full_name}`, repo.lang, repo.tool, userId],
    });
    console.log(`📦 Repo: ${repo.full_name}`);
  }

  // Seed analyses
  for (const a of SAMPLE_ANALYSES) {
    const repo = await db.execute({
      sql: 'SELECT id FROM repos WHERE full_name = ?',
      args: [a.repo],
    });
    const repoId = repo.rows[0]?.id ?? 1;

    const changedFiles = a.files.map(f => ({
      filename: f,
      status: 'modified',
      additions: Math.floor(Math.random() * 50) + 10,
      deletions: Math.floor(Math.random() * 20) + 5,
    }));

    const changedSymbols = a.symbols.map(s => ({
      filePath: a.files[0],
      symbolName: s,
      changeType: 'modified',
    }));

    const blastRadius = {
      riskScore: a.score,
      riskLevel: a.level,
      impactedServices: a.services.map(name => ({
        name,
        entryPoints: a.eps.filter(ep => detectService(ep) === name),
      })),
      dependencyChain: a.files.map((f, i) => ({
        file: f,
        depth: i + 1,
        symbols: a.symbols,
        proofPath: [{
          file: f,
          depth: i + 1,
          symbol: a.symbols[0],
          viaSymbol: a.symbols[0],
          edgeType: 'imports',
        }],
      })),
      totalImpactedFiles: a.files.length + Math.floor(Math.random() * 5),
      entryPointsAffected: a.eps.length > 0,
      recommendations: [
        a.eps.length > 0 ? '🚨 Entry points in blast radius — run integration tests' : null,
        a.score > 50 ? '👥 Request senior review' : null,
        '🧪 Run affected test suite',
      ].filter(Boolean),
    };

    await db.execute({
      sql: `INSERT INTO analyses (repo_id, repo_full_name, pr_number, pr_url, pr_title, pr_author,
            risk_score, risk_level, changed_files, changed_symbols, impacted_services, blast_radius, recommendations, head_sha, pr_updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      args: [
        repoId,
        a.repo,
        a.pr,
        `https://github.com/${a.repo}/pull/${a.pr}`,
        a.title,
        a.author,
        a.score,
        a.level,
        JSON.stringify(changedFiles),
        JSON.stringify(changedSymbols),
        JSON.stringify(a.services),
        JSON.stringify(blastRadius),
        JSON.stringify(blastRadius.recommendations),
        crypto.randomBytes(20).toString('hex'),
      ],
    });
    console.log(`📊 Analysis: ${a.repo}#${a.pr} — ${a.level} (${a.score}/100)`);
  }

  console.log('✅ Demo data seeded successfully!');
  console.log('');
  console.log('To view in dashboard:');
  console.log('  1. Start dev server: pnpm dev');
  console.log('  2. Sign in with GitHub (any account)');
  console.log('  3. Visit http://localhost:3000/repos');
  console.log('  4. Click a repo → Analysis tab');
}

function detectService(filePath: string): string {
  const appsMatch = filePath.match(/(?:apps|packages)\/([^/]+)\//);
  if (appsMatch) return appsMatch[1];
  const featureMatch = filePath.match(/features\/([^/]+)\//);
  if (featureMatch) return featureMatch[1];
  const moduleMatch = filePath.match(/modules\/([^/]+)\//);
  if (moduleMatch) return moduleMatch[1];
  const domainMatch = filePath.match(/src\/([^/]+)\//);
  if (domainMatch) return domainMatch[1];
  return 'core';
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});