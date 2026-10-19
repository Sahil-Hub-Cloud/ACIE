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
    sourceSymbol?: string | null;  // Local name in importing file
    targetSymbol?: string | null;  // Exported name in target file
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

  // Extract imports with symbol names (basic support for named imports)
  const importRegex = /import\s+(?:(?:(\w+)|(?:\*\s+as\s+(\w+))|(?:\{([^}]+)\}))\s+from\s+)?['"]([^'"]+)['"]/g;
  let match: RegExpExecArray | null;
  while ((match = importRegex.exec(content)) !== null) {
    const defaultImport = match[1];
    const namespaceImport = match[2];
    const namedImports = match[3];
    const specifier = match[4];
    const resolved = resolveImport(filePath, specifier, rootPath);
    if (resolved) {
      if (namedImports) {
        // Parse named imports: { foo, bar as baz }
        const namedMatches = namedImports.matchAll(/(\w+)(?:\s+as\s+(\w+))?/g);
        for (const nm of namedMatches) {
          const targetSymbol = nm[1];
          const sourceSymbol = nm[2] || targetSymbol;
          imports.push({ targetFile: resolved, edgeType: 'imports', sourceSymbol, targetSymbol });
        }
      } else if (defaultImport) {
        imports.push({ targetFile: resolved, edgeType: 'imports', sourceSymbol: defaultImport, targetSymbol: 'default' });
      } else if (namespaceImport) {
        imports.push({ targetFile: resolved, edgeType: 'imports', sourceSymbol: namespaceImport, targetSymbol: '*' });
      } else {
        imports.push({ targetFile: resolved, edgeType: 'imports', sourceSymbol: null, targetSymbol: null });
      }
    }
  }

  // Also handle export { } from re-exports
  const reExportRegex = /export\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g;
  let reMatch: RegExpExecArray | null;
  while ((reMatch = reExportRegex.exec(content)) !== null) {
    const namedExports = reMatch[1];
    const specifier = reMatch[2];
    const resolved = resolveImport(filePath, specifier, rootPath);
    if (resolved) {
      const namedMatches = namedExports.matchAll(/(\w+)(?:\s+as\s+(\w+))?/g);
      for (const nm of namedMatches) {
        const targetSymbol = nm[1];
        const sourceSymbol = nm[2] || targetSymbol;
        imports.push({ targetFile: resolved, edgeType: 're-exports', sourceSymbol, targetSymbol });
      }
    }
  }

  // Handle export * from
  const starExportRegex = /export\s+\*\s+from\s+['"]([^'"]+)['"]/g;
  let starMatch: RegExpExecArray | null;
  while ((starMatch = starExportRegex.exec(content)) !== null) {
    const specifier = starMatch[1];
    const resolved = resolveImport(filePath, specifier, rootPath);
    if (resolved) {
      imports.push({ targetFile: resolved, edgeType: 're-exports', sourceSymbol: '*', targetSymbol: '*' });
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

  // Extract imported symbol names from import_clause or export_clause
  const extractImportSymbols = (clauseNode: TSNode | null): Array<{ sourceSymbol: string; targetSymbol: string }> => {
    const result: Array<{ sourceSymbol: string; targetSymbol: string }> = [];
    if (!clauseNode) return result;

    if (clauseNode.type === 'named_imports' || clauseNode.type === 'export_clause') {
      // import { foo, bar as baz } / export { foo, bar as baz }
      for (const child of clauseNode.children) {
        if (child.type === 'import_specifier' || child.type === 'export_specifier') {
          const nameNode = child.childForFieldName('name');
          const aliasNode = child.childForFieldName('alias');
          const targetSymbol = nameNode ? nameNode.text : '*';
          const sourceSymbol = aliasNode ? aliasNode.text : targetSymbol;
          result.push({ sourceSymbol, targetSymbol });
        }
      }
    } else if (clauseNode.type === 'namespace_import' || clauseNode.type === 'namespace_export') {
      // import * as ns / export * as ns
      const aliasNode = clauseNode.childForFieldName('alias');
      const alias = aliasNode ? aliasNode.text : '*';
      result.push({ sourceSymbol: alias, targetSymbol: '*' });
    } else if (clauseNode.type === 'identifier') {
      // import defaultExport / export default defaultExport
      result.push({ sourceSymbol: clauseNode.text, targetSymbol: 'default' });
    }
    return result;
  };

  const addImportEdge = (sourceNode: TSNode | null, sourceSymbols: Array<{ sourceSymbol: string; targetSymbol: string }> = [], edgeType: 'imports' | 're-exports' = 'imports'): void => {
    if (!sourceNode) return;
    const specifier = sourceNode.text.replace(/['"]/g, '');
    const resolved = resolveImport(filePath, specifier, rootPath);
    if (resolved) {
      if (sourceSymbols.length > 0) {
        for (const { sourceSymbol, targetSymbol } of sourceSymbols) {
          imports.push({ targetFile: resolved, edgeType, sourceSymbol, targetSymbol });
        }
      } else {
        imports.push({ targetFile: resolved, edgeType, sourceSymbol: null, targetSymbol: null });
      }
    }
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
          const sourceNode = node.childForFieldName('source');
          
          // Find export_clause by type (it's a child but not a named field)
          const exportClause = node.children.find(child => child.type === 'export_clause');
          
          // Check if this is `export * from` (no export_clause, just * token)
          const hasStarExport = node.children.some(child => child.type === '*');
          
          let reExportSymbols: Array<{ sourceSymbol: string; targetSymbol: string }> = [];
          if (exportClause) {
            reExportSymbols = extractImportSymbols(exportClause);
          } else if (hasStarExport) {
            reExportSymbols = [{ sourceSymbol: '*', targetSymbol: '*' }];
          }
          
          // Use 're-exports' edge type for re-export statements
          addImportEdge(sourceNode, reExportSymbols, 're-exports');
          return;
        }
        case 'import_statement': {
          const sourceNode = node.childForFieldName('source');
          const importClause = node.childForFieldName('declaration'); // import_clause
          const importSymbols = extractImportSymbols(importClause);
          addImportEdge(sourceNode, importSymbols);
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
          sourceSymbol: imp.sourceSymbol,
          targetSymbol: imp.targetSymbol,
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
    sourceSymbol: imp.sourceSymbol,
    targetSymbol: imp.targetSymbol,
  })));
}
