/**
 * ACIE - Code Parser
 * Extracts imports and exports from JavaScript and TypeScript source files
 * using regex-based static analysis (no AST dependency required).
 */

// ─── Import Patterns ──────────────────────────────────────────────────────────

// Matches: import { foo, bar } from './module'
const NAMED_IMPORT_RE = /import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"]/g;

// Matches: import DefaultExport from './module'
const DEFAULT_IMPORT_RE = /import\s+([A-Za-z_$][A-Za-z0-9_$]*)\s+from\s*['"]([^'"]+)['"]/g;

// Matches: import * as Alias from './module'
const NAMESPACE_IMPORT_RE = /import\s*\*\s*as\s+([A-Za-z_$][A-Za-z0-9_$]*)\s+from\s*['"]([^'"]+)['"]/g;

// Matches: import './module'  (side-effect imports)
const SIDE_EFFECT_IMPORT_RE = /import\s*['"]([^'"]+)['"]/g;

// Matches: const foo = require('./module')
const REQUIRE_RE = /(?:const|let|var)\s+\{?([^}=]+)\}?\s*=\s*require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

// ─── Export Patterns ─────────────────────────────────────────────────────────

// Matches: export function foo / export const foo / export class Foo / export async function foo
const NAMED_EXPORT_DECL_RE = /export\s+(?:async\s+)?(?:function|const|let|var|class|enum|type|interface)\s+([A-Za-z_$][A-Za-z0-9_$]*)/g;

// Matches: export { foo, bar, baz }
const NAMED_EXPORT_LIST_RE = /export\s*\{([^}]+)\}/g;

// Matches: export default function foo / export default class Foo
const DEFAULT_EXPORT_NAMED_RE = /export\s+default\s+(?:async\s+)?(?:function|class)\s+([A-Za-z_$][A-Za-z0-9_$]*)/g;

// Matches: module.exports = { foo, bar }
const MODULE_EXPORTS_RE = /module\.exports\s*=\s*\{([^}]+)\}/g;

// Matches: module.exports.foo = ...
const MODULE_EXPORTS_PROP_RE = /module\.exports\.([A-Za-z_$][A-Za-z0-9_$]*)\s*=/g;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Strips single-line and multi-line comments from source code
 * to avoid false positive matches inside comment blocks.
 * @param {string} content
 * @returns {string}
 */
function stripComments(content) {
  return content
    .replace(/\/\*[\s\S]*?\*\//g, '')   // block comments
    .replace(/\/\/[^\n]*/g, '');         // line comments
}

/**
 * Parses a comma-separated list of identifiers (handles aliases like `foo as bar`).
 * @param {string} raw
 * @returns {string[]}
 */
function parseIdentifierList(raw) {
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      // Handle "foo as bar" → take the alias (bar)
      const asPart = s.match(/\bas\s+([A-Za-z_$][A-Za-z0-9_$]*)/);
      if (asPart) return asPart[1];
      return s.replace(/\s+/g, '');
    })
    .filter((s) => /^[A-Za-z_$]/.test(s)); // valid identifiers only
}

// ─── Core Parser ─────────────────────────────────────────────────────────────

/**
 * Parses a JavaScript or TypeScript file and extracts all imports and exports.
 *
 * @param {string} filePath  - Relative or absolute path of the file (used as identifier)
 * @param {string} content   - Raw source code of the file
 * @returns {{
 *   filePath: string,
 *   exports: string[],
 *   imports: Array<{ from: string, names: string[] }>
 * }}
 */
export function parseFile(filePath, content) {
  const src = stripComments(content);

  // ── Collect Imports ───────────────────────────────────────────────────────

  /** @type {Map<string, Set<string>>} module → set of imported names */
  const importMap = new Map();

  const addImport = (from, names) => {
    if (!importMap.has(from)) importMap.set(from, new Set());
    names.forEach((n) => importMap.get(from).add(n));
  };

  let m;

  // Named imports: import { foo, bar } from '...'
  const namedRe = new RegExp(NAMED_IMPORT_RE.source, 'g');
  while ((m = namedRe.exec(src)) !== null) {
    addImport(m[2], parseIdentifierList(m[1]));
  }

  // Default imports: import Foo from '...'
  const defaultRe = new RegExp(DEFAULT_IMPORT_RE.source, 'g');
  while ((m = defaultRe.exec(src)) !== null) {
    // Skip if it looks like a named import leftover
    if (!m[1].includes('{')) {
      addImport(m[2], [m[1].trim()]);
    }
  }

  // Namespace imports: import * as Foo from '...'
  const nsRe = new RegExp(NAMESPACE_IMPORT_RE.source, 'g');
  while ((m = nsRe.exec(src)) !== null) {
    addImport(m[2], [`* as ${m[1].trim()}`]);
  }

  // Side-effect imports: import './module'
  const seRe = new RegExp(SIDE_EFFECT_IMPORT_RE.source, 'g');
  while ((m = seRe.exec(src)) !== null) {
    addImport(m[1], ['(side-effect)']);
  }

  // CommonJS require: const { foo } = require('...')
  const reqRe = new RegExp(REQUIRE_RE.source, 'g');
  while ((m = reqRe.exec(src)) !== null) {
    addImport(m[2], parseIdentifierList(m[1]));
  }

  // ── Collect Exports ───────────────────────────────────────────────────────

  const exportSet = new Set();

  // export function/const/class/etc foo
  const namedDeclRe = new RegExp(NAMED_EXPORT_DECL_RE.source, 'g');
  while ((m = namedDeclRe.exec(src)) !== null) {
    exportSet.add(m[1]);
  }

  // export { foo, bar }
  const namedListRe = new RegExp(NAMED_EXPORT_LIST_RE.source, 'g');
  while ((m = namedListRe.exec(src)) !== null) {
    parseIdentifierList(m[1]).forEach((name) => exportSet.add(name));
  }

  // export default function/class Foo
  const defNamedRe = new RegExp(DEFAULT_EXPORT_NAMED_RE.source, 'g');
  while ((m = defNamedRe.exec(src)) !== null) {
    exportSet.add(m[1]);
  }

  // Check for anonymous export default
  if (/export\s+default\s+(?!(?:async\s+)?(?:function|class)\s+[A-Za-z])/.test(src)) {
    exportSet.add('default');
  }

  // module.exports = { foo, bar }
  const modExRe = new RegExp(MODULE_EXPORTS_RE.source, 'g');
  while ((m = modExRe.exec(src)) !== null) {
    parseIdentifierList(m[1]).forEach((name) => exportSet.add(name));
  }

  // module.exports.foo = ...
  const modExPropRe = new RegExp(MODULE_EXPORTS_PROP_RE.source, 'g');
  while ((m = modExPropRe.exec(src)) !== null) {
    exportSet.add(m[1]);
  }

  // ── Build Result ──────────────────────────────────────────────────────────

  const imports = Array.from(importMap.entries()).map(([from, names]) => ({
    from,
    names: Array.from(names),
  }));

  return {
    filePath,
    exports: Array.from(exportSet),
    imports,
  };
}
