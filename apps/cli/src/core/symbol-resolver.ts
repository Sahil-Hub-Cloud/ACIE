import * as path from 'path';
import * as fs from 'fs';

interface TsConfig {
  compilerOptions?: {
    baseUrl?: string;
    paths?: Record<string, string[]>;
  };
}

interface PackageJson {
  main?: string;
  module?: string;
  exports?: Record<string, unknown> | string;
}

const SOURCE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mts', '.cts'];

let cachedTsConfig: { rootPath: string; config: TsConfig } | null = null;

function loadTsConfig(rootPath: string): TsConfig {
  if (cachedTsConfig?.rootPath === rootPath) return cachedTsConfig.config;

  const tsConfigPath = path.join(rootPath, 'tsconfig.json');
  if (fs.existsSync(tsConfigPath)) {
    try {
      const raw = fs.readFileSync(tsConfigPath, 'utf-8');
      // Strip comments from tsconfig.json before parsing
      const stripped = raw.replace(/\/\/.*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
      const config = JSON.parse(stripped) as TsConfig;
      cachedTsConfig = { rootPath, config };
      return config;
    } catch {
      return {};
    }
  }
  return {};
}

function tryExtensions(base: string): string | null {
  // Try exact path first
  if (fs.existsSync(base) && fs.statSync(base).isFile()) return base;

  // Try with extensions
  for (const ext of SOURCE_EXTENSIONS) {
    const withExt = base + ext;
    if (fs.existsSync(withExt)) return withExt;
  }

  // Try as directory with index file
  for (const ext of SOURCE_EXTENSIONS) {
    const indexFile = path.join(base, `index${ext}`);
    if (fs.existsSync(indexFile)) return indexFile;
  }

  return null;
}

function resolveRelative(importerFile: string, specifier: string): string | null {
  const importerDir = path.dirname(importerFile);
  const absoluteBase = path.resolve(importerDir, specifier);
  return tryExtensions(absoluteBase);
}

function resolveAlias(specifier: string, rootPath: string, tsConfig: TsConfig): string | null {
  const paths = tsConfig.compilerOptions?.paths || {};
  const baseUrl = tsConfig.compilerOptions?.baseUrl
    ? path.resolve(rootPath, tsConfig.compilerOptions.baseUrl)
    : rootPath;

  for (const [alias, targets] of Object.entries(paths)) {
    // Handle glob patterns like '@/*' -> ['./src/*']
    const aliasRegex = new RegExp('^' + alias.replace(/\*/g, '(.*)') + '$');
    const match = specifier.match(aliasRegex);
    if (match) {
      for (const target of targets) {
        const resolved = target.replace(/\*/g, match[1] || '');
        const absolutePath = path.resolve(baseUrl, resolved);
        const result = tryExtensions(absolutePath);
        if (result) return result;
      }
    }
  }
  return null;
}

function resolvePackage(specifier: string, importerFile: string): string | null {
  // Find the nearest node_modules
  let dir = path.dirname(importerFile);
  while (true) {
    const nodeModulesPath = path.join(dir, 'node_modules', specifier);
    
    if (fs.existsSync(nodeModulesPath)) {
      // Check package.json for main/module/exports
      const pkgJsonPath = path.join(nodeModulesPath, 'package.json');
      if (fs.existsSync(pkgJsonPath)) {
        try {
          const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8')) as PackageJson;
          const entryPoint = pkg.module || pkg.main || 'index.js';
          const resolved = path.join(nodeModulesPath, entryPoint);
          if (fs.existsSync(resolved)) return resolved;
        } catch { /* skip */ }
      }
      // Fallback to index.js
      const indexJs = path.join(nodeModulesPath, 'index.js');
      if (fs.existsSync(indexJs)) return indexJs;
    }

    const parentDir = path.dirname(dir);
    if (parentDir === dir) break; // Reached filesystem root
    dir = parentDir;
  }
  return null;
}

/**
 * Resolve a TypeScript/JavaScript import path to an absolute file path.
 * Handles: relative paths, path aliases (tsconfig), package imports (node_modules).
 */
export function resolveImport(
  importerFile: string,
  specifier: string,
  rootPath: string
): string | null {
  // 1. Relative imports
  if (specifier.startsWith('.')) {
    return resolveRelative(importerFile, specifier);
  }

  // 2. Absolute path (rare)
  if (path.isAbsolute(specifier)) {
    return tryExtensions(specifier);
  }

  // 3. Path aliases from tsconfig.json
  const tsConfig = loadTsConfig(rootPath);
  if (tsConfig.compilerOptions?.paths || tsConfig.compilerOptions?.baseUrl) {
    const aliasResult = resolveAlias(specifier, rootPath, tsConfig);
    if (aliasResult) return aliasResult;
  }

  // 4. Node modules (external packages — return null, we only track internal deps)
  // Only return package path if we explicitly want to track node_modules
  if (specifier.startsWith('@') || !specifier.includes('/')) {
    return null; // External package
  }

  // 5. Subpath imports with node_modules
  return resolvePackage(specifier, importerFile);
}

/**
 * Clear the tsconfig cache (useful when rootPath changes between commands)
 */
export function clearResolverCache(): void {
  cachedTsConfig = null;
}
