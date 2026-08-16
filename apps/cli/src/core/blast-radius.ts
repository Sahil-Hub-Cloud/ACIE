import Database from 'better-sqlite3';
import type { BlastRadiusResult, ChangedSymbol } from '@acie/shared';
import { EdgeQueries } from '../utils/db';
import { scoreRisk, isEntryPoint, detectService, generateRecommendations } from './risk-scorer';

const MAX_DEPTH = 10;

interface BFSNode {
  file: string;
  depth: number;
  symbols: string[];
}

/**
 * Calculate blast radius for a set of changed symbols using BFS on the import graph.
 * Returns all downstream dependents, grouped by service, with risk score.
 */
export async function calculateBlastRadius(
  changedSymbols: ChangedSymbol[],
  db: Database.Database
): Promise<BlastRadiusResult & { recommendations: string[] }> {
  // Get unique changed files
  const changedFiles = [...new Set(changedSymbols.map(s => s.filePath))];

  // BFS traversal
  const visited = new Set<string>();
  const dependencyChain: Array<{ file: string; depth: number; symbols: string[] }> = [];
  const queue: BFSNode[] = changedFiles.map(f => ({
    file: f,
    depth: 0,
    symbols: changedSymbols.filter(s => s.filePath === f).map(s => s.symbolName),
  }));

  let entryPointsAffected = false;
  const serviceMap = new Map<string, Set<string>>(); // service -> entry points

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (visited.has(current.file)) continue;
    visited.add(current.file);

    // Check if this is an entry point
    if (isEntryPoint(current.file)) {
      entryPointsAffected = true;
      const service = detectService(current.file);
      if (!serviceMap.has(service)) serviceMap.set(service, new Set());
      serviceMap.get(service)!.add(current.file);
    }

    // Add to chain (exclude the original changed files from the chain)
    if (current.depth > 0) {
      dependencyChain.push({
        file: current.file,
        depth: current.depth,
        symbols: current.symbols,
      });
    }

    // Stop if max depth reached
    if (current.depth >= MAX_DEPTH) continue;

    // Find all files that import the current file
    const importers = EdgeQueries.getImportersOf(db, current.file);

    for (const { source_file } of importers) {
      if (!visited.has(source_file)) {
        queue.push({
          file: source_file,
          depth: current.depth + 1,
          symbols: current.symbols, // Propagate symbol names
        });
      }
    }
  }

  // Also detect services for all impacted files
  for (const { file } of dependencyChain) {
    const service = detectService(file);
    if (!serviceMap.has(service)) {
      serviceMap.set(service, new Set());
    }
    if (isEntryPoint(file)) {
      serviceMap.get(service)!.add(file);
    }
  }

  // Build impacted services list
  const impactedServices = Array.from(serviceMap.entries()).map(([name, eps]) => ({
    name,
    entryPoints: Array.from(eps),
    trafficPerHour: 0, // Would be populated from traffic fetcher
  }));

  // Calculate max depth
  const maxDepth = dependencyChain.reduce((max, node) => Math.max(max, node.depth), 0);

  // Score the risk
  const { score, level } = scoreRisk({
    impactedFilesCount: dependencyChain.length,
    impactedServicesCount: impactedServices.length,
    entryPointsAffected,
    maxDepth,
    changedSymbolsCount: changedSymbols.length,
  });

  // Generate recommendations
  const recommendations = generateRecommendations({
    riskLevel: level,
    entryPointsAffected,
    impactedServicesCount: impactedServices.length,
    changedSymbols,
  });

  return {
    riskScore: score,
    riskLevel: level,
    impactedServices,
    dependencyChain,
    totalImpactedFiles: dependencyChain.length,
    entryPointsAffected,
    recommendations,
  };
}

/**
 * Format blast radius result as a GitHub PR comment in Markdown.
 */
export function formatPRComment(
  prNumber: number,
  changedFiles: string[],
  result: BlastRadiusResult & { recommendations: string[] }
): string {
  const riskEmoji = {
    critical: '🚨',
    high: '🔴',
    medium: '⚠️',
    low: '✅',
  }[result.riskLevel];

  const riskColors = {
    critical: 'ff0000',
    high: 'ff4444',
    medium: 'ff8800',
    low: '00cc44',
  }[result.riskLevel];

  const servicesList = result.impactedServices.length > 0
    ? result.impactedServices.map(s =>
        `  - **${s.name}**${s.entryPoints.length > 0 ? ` (${s.entryPoints.length} entry points)` : ''}`
      ).join('\n')
    : '  - No services affected';

  const chainList = result.dependencyChain.slice(0, 10).map(n =>
    `  ${' '.repeat(n.depth * 2)}- \`${n.file}\` (depth: ${n.depth})`
  ).join('\n');

  const recsList = result.recommendations.map(r => `- ${r}`).join('\n');

  return `## ⚡ ACIE Blast Radius Report — PR #${prNumber}

![Risk Level](https://img.shields.io/badge/Risk-${result.riskLevel.toUpperCase()}-${riskColors}?style=for-the-badge) 
![Score](https://img.shields.io/badge/Score-${result.riskScore}%2F100-${riskColors}?style=for-the-badge)

### ${riskEmoji} Risk Assessment
| Metric | Value |
|--------|-------|
| Risk Score | **${result.riskScore}/100** |
| Risk Level | **${result.riskLevel.toUpperCase()}** |
| Changed Files | ${changedFiles.length} |
| Impacted Files | ${result.totalImpactedFiles} |
| Impacted Services | ${result.impactedServices.length} |
| Entry Points Affected | ${result.entryPointsAffected ? '⚠️ Yes' : '✅ No'} |

### 📦 Impacted Services
${servicesList}

### 🔗 Dependency Chain (top 10)
${chainList || '  - No downstream dependencies found'}

### 💡 Recommendations
${recsList}

---
<sub>Generated by [ACIE 2.0](https://github.com/Sahil-Hub-Cloud/ACIE) — AI Change Impact Engine</sub>`;
}
