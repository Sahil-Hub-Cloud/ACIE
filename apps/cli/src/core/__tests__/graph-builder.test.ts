import { describe, it, expect, afterAll } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { parseFileAST, parseFileRegex, buildGraph, ParseResult } from '../graph-builder';
import { getDb, closeDb } from '../../utils/db';

type TSParser = InstanceType<typeof import('tree-sitter')>;

function loadAstParser(): { parser: TSParser; lang: unknown } | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ParserCtor = require('tree-sitter') as typeof import('tree-sitter');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const lang = (require('tree-sitter-typescript') as { typescript: unknown }).typescript;
    const parser = new ParserCtor();
    parser.setLanguage(lang);
    return { parser, lang };
  } catch {
    return null;
  }
}

const FIXTURE_A = [
  "import { y } from './b';",
  "export { z } from './c';",
  'export function foo() { return 1; }',
  'export class Widget {}',
  'export const bar = 42;',
  'export interface Shape { id: string }',
  'export type ShapeId = string;',
  'function local() {}',
  'export default class Main {}',
  '',
].join('\n');

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'acie-graph-test-'));
const fileA = path.join(tmpRoot, 'a.ts');
const fileB = path.join(tmpRoot, 'b.ts');
const fileC = path.join(tmpRoot, 'c.ts');
fs.writeFileSync(fileA, FIXTURE_A);
fs.writeFileSync(fileB, 'export const y = 1;\n');
fs.writeFileSync(fileC, 'export const z = 2;\n');

const ast = loadAstParser();
const describeAst = ast ? describe : describe.skip;

function ofName(result: ParseResult, name: string) {
  return result.symbols.filter(s => s.symbolName === name);
}

function edgeTo(result: ParseResult, target: string) {
  return result.imports.filter(i => i.targetFile === target);
}

function expectCoreSymbols(result: ParseResult): void {
  const foo = ofName(result, 'foo');
  expect(foo).toHaveLength(1);
  expect(foo[0].isExported).toBe(true);
  expect(foo[0].symbolKind).toBe('function');

  const widget = ofName(result, 'Widget');
  expect(widget).toHaveLength(1);
  expect(widget[0].isExported).toBe(true);
  expect(widget[0].symbolKind).toBe('class');

  const bar = ofName(result, 'bar');
  expect(bar).toHaveLength(1);
  expect(bar[0].isExported).toBe(true);

  expect(ofName(result, 'local')).toHaveLength(1);
  expect(ofName(result, 'local')[0].isExported).toBe(false);

  expect(edgeTo(result, fileB)).toHaveLength(1);
  expect(edgeTo(result, fileC)).toHaveLength(1);
}

describe('parseFileRegex', () => {
  it('extracts exports, locals, and import edges', () => {
    const result = parseFileRegex(fileA, FIXTURE_A, tmpRoot);
    expectCoreSymbols(result);
    expect(ofName(result, 'Shape')[0].isExported).toBe(true);
    expect(ofName(result, 'ShapeId')[0].isExported).toBe(true);
    const main = ofName(result, 'Main');
    expect(main).toHaveLength(1);
    expect(main[0].isExported).toBe(true);
  });
});

describeAst('parseFileAST', () => {
  it('records each exported declaration exactly once (no double-walk duplicates)', () => {
    expect(ast).not.toBeNull();
    const result = parseFileAST(fileA, FIXTURE_A, ast!.parser, ast!.lang, tmpRoot);
    expectCoreSymbols(result);
  });

  it('captures export const/interface/type/default-class declarations', () => {
    const result = parseFileAST(fileA, FIXTURE_A, ast!.parser, ast!.lang, tmpRoot);

    const bar = ofName(result, 'bar');
    expect(bar).toHaveLength(1);
    expect(bar[0].isExported).toBe(true);
    expect(bar[0].symbolKind).toBe('const');

    const shape = ofName(result, 'Shape');
    expect(shape).toHaveLength(1);
    expect(shape[0].isExported).toBe(true);
    expect(shape[0].symbolKind).toBe('interface');

    const shapeId = ofName(result, 'ShapeId');
    expect(shapeId).toHaveLength(1);
    expect(shapeId[0].isExported).toBe(true);
    expect(shapeId[0].symbolKind).toBe('type');

    const main = ofName(result, 'Main');
    expect(main).toHaveLength(1);
    expect(main[0].isExported).toBe(true);
    expect(main[0].symbolKind).toBe('class');
  });

  it('resolves `export { x } from` re-export edges', () => {
    const result = parseFileAST(fileA, FIXTURE_A, ast!.parser, ast!.lang, tmpRoot);
    expect(edgeTo(result, fileC)).toHaveLength(1);
    // re-export specifiers must not invent extra symbols
    expect(ofName(result, 'z')).toHaveLength(0);
  });
});

describe('buildGraph integration', () => {
  it('writes a deduplicated graph with exported-symbol flags', async () => {
    const dbPath = path.join(tmpRoot, 'graph.db');
    await buildGraph(tmpRoot, dbPath);

    const db = getDb(dbPath);
    const fooRows = db
      .prepare("SELECT is_exported FROM nodes WHERE file_path = 'a.ts' AND symbol_name = 'foo'")
      .all() as Array<{ is_exported: number }>;
    expect(fooRows).toHaveLength(1);
    expect(fooRows[0].is_exported).toBe(1);

    const barRows = db
      .prepare("SELECT is_exported FROM nodes WHERE file_path = 'a.ts' AND symbol_name = 'bar'")
      .all() as Array<{ is_exported: number }>;
    expect(barRows).toHaveLength(1);
    expect(barRows[0].is_exported).toBe(1);

    const edges = db
      .prepare("SELECT COUNT(*) as c FROM edges WHERE source_file = 'a.ts' AND target_file = 'c.ts'")
      .get() as { c: number };
    expect(edges.c).toBe(1);
  });

  it('unique index rejects duplicate node rows', async () => {
    const db = getDb();
    const before = (db.prepare('SELECT COUNT(*) as c FROM nodes').get() as { c: number }).c;
    db.prepare(
      "INSERT OR IGNORE INTO nodes (file_path, symbol_name, symbol_kind, line_number, is_exported) VALUES ('a.ts', 'foo', 'function', 1, 1)"
    ).run();
    const after = (db.prepare('SELECT COUNT(*) as c FROM nodes').get() as { c: number }).c;
    expect(after).toBe(before);
  });
});

afterAll(() => {
  closeDb();
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});
