import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import Database from 'better-sqlite3';
import { getDb, NodeQueries, EdgeQueries } from '../utils/db';
import { spinner, logger } from '../utils/logger';
import { resolveImport } from './symbol-resolver';

// Tree-sitter is loaded lazily to handle optional native binary
let parserInstance: InstanceType<typeof import('tree-sitter')> | null = null;
let TypeScript: unknown = null;

async function loadTreeSitter() {
  if (parserInstance) return { Parser: parserInstance, TypeScript };
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ParserCtor = require('tree-sitter') as typeof import('tree-sitter');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const tsLang = (require('tree-sitter-typescript') as { typescript: unknown }).typescript;
    const instance = new ParserCtor();
    instance.setLanguage(tsLang);
    parserInstance = instance;
    TypeScript = tsLang;
    return { Parser: parserInstance, TypeScript };
  } catch {
    logger.warn('tree-sitter not available — falling back to regex parser');
    return { Parser: null, TypeScript: null };
  }
}

// ── Regex fallback parser (works without native binary) ─────────────────────

export interface ParseResult {
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

export function parseFileRegex(filePath: string, content: string, rootPath: string): ParseResult {
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
    const resolved = resolveImport(filePath, specifier, rootPath);
    if (resolved) {
      imports.push({ targetFile: resolved, edgeType: 'imports' });
    }
  }

  return { symbols, imports };
}

// ── Tree-sitter AST parser ───────────────────────────────────────────────────

export function parseFileAST(
  filePath: string,
  content: string,
  parser: InstanceType<typeof import('tree-sitter')>,
  tsLang: unknown,
  rootPath: string
): ParseResult {
  const symbols: ParseResult['symbols'] = [];
  const imports: ParseResult['imports'] = [];

  type TSNode = import('tree-sitter').SyntaxNode;

  const pushSymbol = (nameNode: TSNode, kind: string, row: number, isExported: boolean): void => {
    symbols.push({ symbolName: nameNode.text, symbolKind: kind, lineNumber: row, isExported });
  };

  const addImportEdge = (sourceNode: TSNode | null): void => {
    if (!sourceNode) return;
    const specifier = sourceNode.text.replace(/['"]/g, '');
    const resolved = resolveImport(filePath, specifier, rootPath);
    if (resolved) imports.push({ targetFile: resolved, edgeType: 'imports' });
  };

  const recordDeclaration = (decl: TSNode, isExported: boolean): void => {
    const nameNode = decl.childForFieldName('name');
    if (nameNode) {
      pushSymbol(nameNode, mapKind(decl.type), decl.startPosition.row + 1, isExported);
      return;
    }
    // const/let/var declarations have no name field — names live on variable_declarator children
    if (decl.type === 'lexical_declaration' || decl.type === 'variable_declaration') {
      for (const child of decl.children) {
        if (child.type === 'variable_declarator') {
          const declaratorName = child.childForFieldName('name');
          if (declaratorName) pushSymbol(declaratorName, 'const', child.startPosition.row + 1, isExported);
        }
      }
    }
  };

  try {
    parser.setLanguage(tsLang);
    const tree = parser.parse(content);
    const root = tree.rootNode;

    const walk = (node: TSNode): void => {
      switch (node.type) {
        case 'export_statement': {
          const decl = node.childForFieldName('declaration');
          if (decl) {
            // Record the exported declaration here, then walk only its body so the
            // bare function/class declaration cases below don't record it a second time.
            recordDeclaration(decl, true);
            for (const child of decl.children) {
              if (child) walk(child);
            }
            return;
          }
          // export { x } from './y' / export * from './y' — edge, not a new local symbol
          addImportEdge(node.childForFieldName('source'));
          return;
        }
        case 'import_statement': {
          addImportEdge(node.childForFieldName('source'));
          break;
        }
        case 'function_declaration':
        case 'class_declaration': {
          const nameNode = node.childForFieldName('name');
          if (nameNode) {
            pushSymbol(nameNode, node.type.includes('function') ? 'function' : 'class', node.startPosition.row + 1, false);
          }
          break;
        }
      }
      for (const child of node.children) {
        if (child) walk(child);
      }
    };

    walk(root);
  } catch (err) {
    logger.warn(`AST parse failed for ${path.relative(rootPath, filePath)}, using regex fallback: ${err instanceof Error ? err.message : String(err)}`);
    return parseFileRegex(filePath, content, rootPath);
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
        result = parseFileAST(filePath, content, parser, tsLang, rootPath);
      } else {
        result = parseFileRegex(filePath, content, rootPath);
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
    } catch (err) {
      logger.warn(`Skipping unparseable file ${path.relative(rootPath, filePath)}: ${err instanceof Error ? err.message : String(err)}`);
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
    result = parseFileAST(filePath, content, parser, tsLang, rootPath);
  } else {
    result = parseFileRegex(filePath, content, rootPath);
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
