import type { ChangedFile, ChangedSymbol } from '@acie/shared';

interface DiffChunk {
  header: string;
  removedLines: string[];
  addedLines: string[];
}

/**
 * Parse a unified git diff into changed symbols by comparing
 * export statements in added vs removed lines.
 */
export function analyzeDiff(
  filePath: string,
  patch: string
): ChangedSymbol[] {
  if (!patch) return [];

  const changes: ChangedSymbol[] = [];
  const chunks = parseDiffChunks(patch);

  for (const chunk of chunks) {
    // Find removed exports
    const removedExports = extractExports(chunk.removedLines);
    const addedExports = extractExports(chunk.addedLines);

    for (const symbol of removedExports.values()) {
      if (!addedExports.has(symbol.name)) {
        changes.push({
          filePath,
          symbolName: symbol.name,
          changeType: 'removed',
        });
      }
    }

    for (const symbol of addedExports.values()) {
      if (!removedExports.has(symbol.name)) {
        changes.push({
          filePath,
          symbolName: symbol.name,
          changeType: 'added',
        });
      } else {
        // Symbol exists in both — it was modified
        changes.push({
          filePath,
          symbolName: symbol.name,
          changeType: 'modified',
        });
      }
    }
  }

  return changes;
}

/**
 * Analyze multiple changed files and return all changed symbols.
 */
export function analyzeChangedFiles(changedFiles: Array<ChangedFile & { patch?: string }>): ChangedSymbol[] {
  const allSymbols: ChangedSymbol[] = [];

  for (const file of changedFiles) {
    if (!file.patch) continue;
    
    const symbols = analyzeDiff(file.filename, file.patch);
    
    // If no exports found in diff, treat the file itself as changed
    if (symbols.length === 0 && file.status === 'modified') {
      allSymbols.push({
        filePath: file.filename,
        symbolName: '*', // Wildcard — entire file changed
        changeType: 'modified',
      });
    } else {
      allSymbols.push(...symbols);
    }
  }

  return allSymbols;
}

function parseDiffChunks(patch: string): DiffChunk[] {
  const chunks: DiffChunk[] = [];
  const lines = patch.split('\n');
  let currentChunk: DiffChunk | null = null;

  for (const line of lines) {
    if (line.startsWith('@@')) {
      currentChunk = { header: line, removedLines: [], addedLines: [] };
      chunks.push(currentChunk);
    } else if (currentChunk) {
      if (line.startsWith('-') && !line.startsWith('---')) {
        currentChunk.removedLines.push(line.slice(1));
      } else if (line.startsWith('+') && !line.startsWith('+++')) {
        currentChunk.addedLines.push(line.slice(1));
      }
    }
  }

  return chunks;
}

function extractExports(lines: string[]): Map<string, { name: string; kind: string }> {
  const exports = new Map<string, { name: string; kind: string }>();
  const patterns = [
    { regex: /export\s+(?:default\s+)?(?:async\s+)?function\s+(\w+)/, kind: 'function' },
    { regex: /export\s+(?:default\s+)?class\s+(\w+)/, kind: 'class' },
    { regex: /export\s+interface\s+(\w+)/, kind: 'interface' },
    { regex: /export\s+type\s+(\w+)/, kind: 'type' },
    { regex: /export\s+(?:const|let|var)\s+(\w+)/, kind: 'const' },
    { regex: /export\s+enum\s+(\w+)/, kind: 'const' },
    // Python / Go
    { regex: /^(?:def|async def|class)\s+(\w+)/, kind: 'function' },
    { regex: /^func\s+(\w+)/, kind: 'function' },
  ];

  for (const line of lines) {
    const trimmed = line.trim();
    for (const { regex, kind } of patterns) {
      const match = trimmed.match(regex);
      if (match && match[1]) {
        exports.set(match[1], { name: match[1], kind });
        break;
      }
    }
  }

  return exports;
}
