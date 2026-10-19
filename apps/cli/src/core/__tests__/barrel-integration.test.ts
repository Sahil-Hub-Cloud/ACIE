import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { buildGraph } from '../graph-builder';
import { getDb, closeDb } from '../../utils/db';

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'acie-barrel-test-'));

// Create tsconfig.json for path alias testing
const tsconfig = {
  compilerOptions: {
    baseUrl: '.',
    paths: {
      '@/features/*': ['features/*']
    }
  }
};
fs.writeFileSync(path.join(tmpRoot, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2));

// Barrel file structure: features/user/index.ts re-exports from ./service
const userDir = path.join(tmpRoot, 'features', 'user');
fs.mkdirSync(userDir, { recursive: true });
fs.writeFileSync(path.join(userDir, 'service.ts'), 'export function getUser() { return {}; }\nexport interface User { id: string; }\n');
fs.writeFileSync(path.join(userDir, 'index.ts'), "export * from './service';\nexport { getUser } from './service';\n");

// Consumer imports from barrel
const consumerDir = path.join(tmpRoot, 'apps', 'api');
fs.mkdirSync(consumerDir, { recursive: true });
fs.writeFileSync(path.join(consumerDir, 'route.ts'), "import { getUser, User } from '@/features/user';\n");

describe('buildGraph with barrel files and path aliases', () => {
  let dbPath: string;
  
  beforeAll(async () => {
    dbPath = path.join(tmpRoot, 'graph.db');
    await buildGraph(tmpRoot, dbPath);
  });

  it('creates edges from consumer to barrel file', async () => {
    const db = getDb(dbPath);
    const consumerPath = 'apps/api/route.ts';
    const barrelPath = 'features/user/index.ts';
    
    const edges = db.prepare("SELECT * FROM edges WHERE source_file = ? AND target_file = ?").all(consumerPath, barrelPath) as Array<{ source_file: string; target_file: string }>;
    console.log('Consumer -> barrel edges:', edges);
    expect(edges.length).toBeGreaterThanOrEqual(1);
  });

  it('creates edges from barrel to underlying implementation', async () => {
    const db = getDb(dbPath);
    const barrelPath = 'features/user/index.ts';
    const servicePath = 'features/user/service.ts';
    
    const edges = db.prepare("SELECT * FROM edges WHERE source_file = ? AND target_file = ?").all(barrelPath, servicePath) as Array<{ source_file: string; target_file: string }>;
    console.log('Barrel -> service edges:', edges);
    expect(edges.length).toBeGreaterThanOrEqual(1);
  });
});

afterAll(() => {
  closeDb();
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});