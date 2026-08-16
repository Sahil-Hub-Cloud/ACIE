import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import Database from 'better-sqlite3';
import { getDb, NodeQueries, EdgeQueries } from '../utils/db';
import { spinner, logger } from '../utils/logger';
import { resolveImport } from './symbol-resolver';

// Tree-sitter is loaded lazily to handle optional native binary
let Parser: typeof import('tree-sitter') | null = null;
let TypeScript: unknown = null;

async function loadTreeSitter() {
  if (Parser) return { Parser, TypeScript };
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    Parser = require('tree-sitter');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    TypeScript = require('tree-sitter-typescript').typescript;
    return { Parser, TypeScript };
  } catch {
    logger.warn('tree-sitter not available — falling back to regex parser');
    return { Parser: null, TypeScript: null };
  }
}

// ── Regex fallback parser (works without native binary) ─────────────────────

interface ParseResult {
  symbols: Array<{
    symbolName: string;
    symbolKind: string;
    lineNumber: number;
    isExported: boolean;
  }>;
  imports: Array<{
    targetFile: string;
    edgeType: string;
  }>;
}

function parseFileRegex(filePath: string, content: string): ParseResult {
  const symbols: ParseResult['symbols'] = [];
  const imports: ParseResult['imports'] = [];
  const lines = content.split('\n');

  // Extract exports
  const exportPatterns = [
    { regex: /^export\s+(default\s+)?(async\s+)?function\s+(\w+)/m, kind: 'function', group: 3 },
    { regex: /^export\s+(default\s+)?class\s+(\w+)/m, kind: 'class', group: 2 },
    { regex: /^export\s+interface\s+(\w+)/m, kind: 'interface', group: 1 },
    { regex: /^export\s+type\s+(\w+)/m, kind: 'type', group: 1 },
    { regex: /^export\s+(?:const|let|var)\s+(\w+)/m, kind: 'const', group: 1 },
    { regex: /^export\s+enum\s+(\w+)/m, kind: 'const', group: 1 },
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const { regex, kind, group } of exportPatterns) {
      const match = line.match(regex);
      if (match && match[group]) {
        symbols.push({
          symbolName: match[group],
          symbolKind: kind,
          lineNumber: i + 1,
          isExported: true,
        });
      }
    }

    // Also collect non-exported top-level functions/classes
    const localFn = line.match(/^(?:async\s+)?function\s+(\w+)/);
    if (localFn) {
      symbols.push({ symbolName: localFn[1], symbolKind: 'function', lineNumber: i + 1, isExported: false });
    }
  }

  // Extract imports
  const importRegex = /(?:import|from)\s+['"]([^'"]+)['"]/g;
  let match: RegExpExecArray | null;
  while ((match = importRegex.exec(content)) !== null) {
    const specifier = match[1];
    const resolved = resolveImport(filePath, specifier, path.dirname(filePath));
    if (resolved) {
      imports.push({ targetFile: resolved, edgeType: 'imports' });
    }
  }

  return { symbols, imports };
}

// ── Tree-sitter AST parser ───────────────────────────────────────────────────

function parseFileAST(filePath: string, content: string, parser: typeof import('tree-sitter'), tsLang: unknown): ParseResult {
  const symbols: ParseResult['symbols'] = [];
  const imports: ParseResult['imports'] = [];

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (parser as any).setLanguage(tsLang);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tree = (parser as any).parse(content);
    const root = tree.rootNode;

    function walk(node: any) {
      switch (node.type) {
        case 'export_statement': {
          const decl = node.childForFieldName('declaration');
          if (decl) {
            const nameNode = decl.childForFieldName('name');
            if (nameNode) {
              const kind = decl.type.replace('_declaration', '').replace('_definition', '');
              symbols.push({
                symbolName: nameNode.text,
                symbolKind: mapKind(kind),
                lineNumber: node.startPosition.row + 1,
                isExported: true,
              });
            }
          }
          break;
        }
        case 'import_statement': {
          const src = node.childForFieldName('source');
          if (src) {
            const specifier = src.text.replace(/['"]/g, '');
            const resolved = resolveImport(filePath, specifier, path.dirname(filePath));
            if (resolved) {
              imports.push({ targetFile: resolved, edgeType: 'imports' });
            }
          }
          break;
        }
        case 'function_declaration':
        case 'class_declaration': {
          const nameNode = node.childForFieldName('name');
          if (nameNode) {
            symbols.push({
              symbolName: nameNode.text,
              symbolKind: node.type.includes('function') ? 'function' : 'class',
              lineNumber: node.startPosition.row + 1,
              isExported: false,
            });
          }
          break;
        }
      }
      for (const child of node.children) {
        if (child) walk(child);
      }
    }

    walk(root);
  } catch {
    // Fallback silently
    return parseFileRegex(filePath, content);
  }

  return { symbols, imports };
}

function mapKind(raw: string): string {
  if (raw.includes('function')) return 'function';
  if (raw.includes('class')) return 'class';
  if (raw.includes('interface')) return 'interface';
  if (raw.includes('type')) return 'type';
  return 'const';
}

// ── Ignore patterns ──────────────────────────────────────────────────────────

const IGNORE_DIRS = ['node_modules', 'dist', '.git', 'coverage', '.next', '__pycache__', 'build', '.turbo'];
const SUPPORTED_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.py', '.go'];

function shouldIgnore(filePath: string): boolean {
  return IGNORE_DIRS.some(dir => filePath.includes(`/${dir}/`) || filePath.includes(`\\${dir}\\`));
}

// ── Main buildGraph function ─────────────────────────────────────────────────

export async function buildGraph(rootPath: string, dbPath: string): Promise<void> {
  const spin = spinner('Initializing graph builder...');
  
  const db = getDb(dbPath);
  const { Parser: parser, TypeScript: tsLang } = await loadTreeSitter();

  // Find all source files
  spin.text = 'Scanning source files...';
  const patterns = SUPPORTED_EXTENSIONS.map(ext => `**/*${ext}`);
  const files = (await glob(patterns, {
    cwd: rootPath,
    absolute: true,
    ignore: IGNORE_DIRS.map(d => `**/${d}/**`),
  })).filter(f => !shouldIgnore(f));

  spin.text = `Found ${files.length} source files. Parsing...`;

  let processed = 0;
  const BATCH_SIZE = 50;
  let nodeBatch: Parameters<typeof NodeQueries.insertBatch>[1] = [];
  let edgeBatch: Parameters<typeof EdgeQueries.insertBatch>[1] = [];

  // Clear existing graph for this build
  db.exec('DELETE FROM nodes; DELETE FROM edges;');

  for (const filePath of files) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const relativePath = path.relative(rootPath, filePath).replace(/\\/g, '/');

      let result: ParseResult;
      if (parser && tsLang && filePath.match(/\.(ts|tsx|js|jsx)$/)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result = parseFileAST(filePath, content, parser as any, tsLang);
      } else {
        result = parseFileRegex(filePath, content);
      }

      // Accumulate nodes
      for (const sym of result.symbols) {
        nodeBatch.push({
          filePath: relativePath,
          symbolName: sym.symbolName,
          symbolKind: sym.symbolKind,
          lineNumber: sym.lineNumber,
          isExported: sym.isExported,
        });
      }

      // Accumulate edges
      for (const imp of result.imports) {
        const targetRelative = path.relative(rootPath, imp.targetFile).replace(/\\/g, '/');
        edgeBatch.push({
          sourceFile: relativePath,
          targetFile: targetRelative,
          edgeType: imp.edgeType,
        });
      }

      processed++;

      // Flush batches
      if (nodeBatch.length >= BATCH_SIZE) {
        NodeQueries.insertBatch(db, nodeBatch);
        nodeBatch = [];
      }
      if (edgeBatch.length >= BATCH_SIZE) {
        EdgeQueries.insertBatch(db, edgeBatch);
        edgeBatch = [];
      }

      if (processed % 100 === 0) {
        spin.text = `Parsed ${processed}/${files.length} files...`;
      }
    } catch {
      // Skip unparseable files silently
    }
  }

  // Flush remaining batches
  if (nodeBatch.length > 0) NodeQueries.insertBatch(db, nodeBatch);
  if (edgeBatch.length > 0) EdgeQueries.insertBatch(db, edgeBatch);

  const nodeCount = (db.prepare('SELECT COUNT(*) as c FROM nodes').get() as { c: number }).c;
  const edgeCount = (db.prepare('SELECT COUNT(*) as c FROM edges').get() as { c: number }).c;

  spin.succeed(`Graph built! ${nodeCount} symbols, ${edgeCount} import edges from ${files.length} files.`);
}

// ── Update single file in graph ───────────────────────────────────────────────

export async function updateFileInGraph(
  filePath: string,
  rootPath: string,
  db: Database.Database
): Promise<void> {
  const relativePath = path.relative(rootPath, filePath).replace(/\\/g, '/');
  
  // Remove old data for this file
  NodeQueries.deleteByFile(db, relativePath);
  EdgeQueries.deleteByFile(db, relativePath);

  if (!fs.existsSync(filePath)) return; // File was deleted

  const content = fs.readFileSync(filePath, 'utf-8');
  const { Parser: parser, TypeScript: tsLang } = await loadTreeSitter();

  let result: ParseResult;
  if (parser && tsLang && filePath.match(/\.(ts|tsx|js|jsx)$/)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result = parseFileAST(filePath, content, parser as any, tsLang);
  } else {
    result = parseFileRegex(filePath, content);
  }

  NodeQueries.insertBatch(db, result.symbols.map(s => ({
    filePath: relativePath,
    ...s,
  })));

  EdgeQueries.insertBatch(db, result.imports.map(imp => ({
    sourceFile: relativePath,
    targetFile: path.relative(rootPath, imp.targetFile).replace(/\\/g, '/'),
    edgeType: imp.edgeType,
  })));
}
