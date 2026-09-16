/**
 * In-memory blast radius calculator for Vercel serverless functions.
 * This re-implements the core BFS algorithm from @acie/cli without
 * requiring better-sqlite3 (a native module incompatible with serverless).
 */

export interface GraphEdge {
  sourceFile: string;
  targetFile: string;
}

interface BFSNode {
  file: string;
  depth: number;
  symbols: string[];
}

export interface BlastRadiusResult {
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  impactedServices: Array<{
    name: string;
    entryPoints: string[];
  }>;
  dependencyChain: Array<{
    file: string;
    depth: number;
    symbols: string[];
  }>;
  totalImpactedFiles: number;
  entryPointsAffected: boolean;
  recommendations: string[];
}

const MAX_DEPTH = 10;

/**
 * Hidden marker used to find and update our own PR comment instead of
 * posting a fresh one on every push to the branch.
 */
export const ACIE_COMMENT_MARKER = '<!-- acie:blast-radius -->';

// Entry point patterns
const ENTRY_POINT_PATTERNS = [
  /\.controller\.(ts|js)$/,
  /\.route\.(ts|js)$/,
  /\/pages\/.*\.(ts|tsx|js|jsx)$/,
  /\/app\/.*\/page\.(ts|tsx)$/,
  /\/app\/.*\/route\.(ts|js)$/,
  /server\.(ts|js)$/,
  /main\.(ts|js)$/,
  /index\.(ts|js)$/,
  /handler\.(ts|js)$/,
  /lambda\.(ts|js)$/,
];

function isEntryPoint(filePath: string): boolean {
  return ENTRY_POINT_PATTERNS.some(pattern => pattern.test(filePath));
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

function scoreToLevel(score: number): BlastRadiusResult['riskLevel'] {
  if (score >= 76) return 'critical';
  if (score >= 51) return 'high';
  if (score >= 26) return 'medium';
  return 'low';
}

function calculateRiskScore(params: {
  impactedFilesCount: number;
  impactedServicesCount: number;
  entryPointsAffected: boolean;
  maxDepth: number;
  changedSymbolsCount: number;
}): { score: number; level: BlastRadiusResult['riskLevel'] } {
  let score = 0;
  if (params.entryPointsAffected) score += 35;
  score += Math.min(params.impactedServicesCount * 10, 30);
  score += Math.min(params.maxDepth * 2, 10);
  score += Math.min(params.impactedFilesCount, 20);
  score += Math.min(params.changedSymbolsCount, 5);
  score = Math.min(score, 100);
  return { score, level: scoreToLevel(score) };
}

/**
 * Build an adjacency map from edges: targetFile -> Set<sourceFile>
 * (who imports this file)
 */
function buildImporterMap(edges: GraphEdge[]): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  for (const edge of edges) {
    if (!map.has(edge.targetFile)) map.set(edge.targetFile, new Set());
    map.get(edge.targetFile)!.add(edge.sourceFile);
  }
  return map;
}

/**
 * Calculate blast radius using BFS on an in-memory graph.
 */
export function calculateBlastRadiusInMemory(
  changedFiles: string[],
  changedSymbols: Array<{ filePath: string; symbolName: string; changeType: string }>,
  edges: GraphEdge[],
): BlastRadiusResult {
  const importerMap = buildImporterMap(edges);
  const visited = new Set<string>();
  const dependencyChain: BlastRadiusResult['dependencyChain'] = [];
  let entryPointsAffected = false;
  const serviceMap = new Map<string, Set<string>>();

  const queue: BFSNode[] = changedFiles.map(f => ({
    file: f,
    depth: 0,
    symbols: changedSymbols.filter(s => s.filePath === f).map(s => s.symbolName),
  }));

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current.file)) continue;
    visited.add(current.file);

    if (isEntryPoint(current.file)) {
      entryPointsAffected = true;
      const service = detectService(current.file);
      if (!serviceMap.has(service)) serviceMap.set(service, new Set());
      serviceMap.get(service)!.add(current.file);
    }

    if (current.depth > 0) {
      dependencyChain.push({
        file: current.file,
        depth: current.depth,
        symbols: current.symbols,
      });
    }

    if (current.depth >= MAX_DEPTH) continue;

    const importerSet = importerMap.get(current.file) || new Set<string>();
    const importers = Array.from(importerSet);
    for (const source of importers) {
      if (!visited.has(source)) {
        queue.push({
          file: source,
          depth: current.depth + 1,
          symbols: current.symbols,
        });
      }
    }
  }

  // Detect services for all impacted files
  for (const { file } of dependencyChain) {
    const service = detectService(file);
    if (!serviceMap.has(service)) serviceMap.set(service, new Set());
    if (isEntryPoint(file)) serviceMap.get(service)!.add(file);
  }

  const impactedServices: Array<{ name: string; entryPoints: string[] }> = [];
  const serviceEntries = Array.from(serviceMap.entries());
  for (const [name, eps] of serviceEntries) {
    impactedServices.push({ name, entryPoints: Array.from(eps) });
  }

  const maxDepth = dependencyChain.reduce((max, n) => Math.max(max, n.depth), 0);

  const { score, level } = calculateRiskScore({
    impactedFilesCount: dependencyChain.length,
    impactedServicesCount: impactedServices.length,
    entryPointsAffected,
    maxDepth,
    changedSymbolsCount: changedSymbols.length,
  });

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

function generateRecommendations(params: {
  riskLevel: string;
  entryPointsAffected: boolean;
  impactedServicesCount: number;
  changedSymbols: Array<{ symbolName: string; changeType: string }>;
}): string[] {
  const recs: string[] = [];
  const removed = params.changedSymbols.filter(s => s.changeType === 'removed');
  const modified = params.changedSymbols.filter(s => s.changeType === 'modified');

  if (removed.length > 0) {
    recs.push(`⚠️ Removed exports: ${removed.map(s => `\`${s.symbolName}\``).join(', ')}. All downstream importers will break.`);
    recs.push('📋 Run `acie analyze` to find all files that import these symbols.');
  }
  if (modified.length > 0) {
    recs.push(`🔄 Modified exports: ${modified.map(s => `\`${s.symbolName}\``).join(', ')}. Verify interface compatibility.`);
  }
  if (params.entryPointsAffected) {
    recs.push('🚨 Entry points (routes/controllers) are in the blast radius — runtime behavior may change.');
    recs.push('🧪 Run integration tests against all affected endpoints.');
  }
  if (params.impactedServicesCount > 2) {
    recs.push(`📦 ${params.impactedServicesCount} services impacted — consider coordinated deployment.`);
  }
  if (params.riskLevel === 'critical' || params.riskLevel === 'high') {
    recs.push('👥 Request review from senior engineers and affected service owners.');
    recs.push('🔀 Consider feature flags to safely roll out this change.');
  }
  if (recs.length === 0) {
    recs.push('✅ No critical issues detected. Standard review process applies.');
  }
  return recs;
}

/**
 * Format blast radius result as a GitHub PR comment (Markdown).
 */
export function formatPRComment(
  prNumber: number,
  changedFiles: string[],
  result: BlastRadiusResult,
): string {
  const riskEmoji: Record<string, string> = {
    critical: '🚨',
    high: '🔴',
    medium: '⚠️',
    low: '✅',
  };
  const riskColors: Record<string, string> = {
    critical: 'ff0000',
    high: 'ff4444',
    medium: 'ff8800',
    low: '00cc44',
  };

  const emoji = riskEmoji[result.riskLevel] || '✅';
  const color = riskColors[result.riskLevel] || '00cc44';

  const servicesList = result.impactedServices.length > 0
    ? result.impactedServices.map(s =>
        `  - **${s.name}**${s.entryPoints.length > 0 ? ` (${s.entryPoints.length} entry points)` : ''}`
      ).join('\n')
    : '  - No services affected';

  const chainList = result.dependencyChain.slice(0, 10).map(n =>
    `  ${' '.repeat(n.depth * 2)}- \`${n.file}\` (depth: ${n.depth})`
  ).join('\n');

  const recsList = result.recommendations.map(r => `- ${r}`).join('\n');

  return `${ACIE_COMMENT_MARKER}
## ⚡ ACIE Blast Radius Report — PR #${prNumber}

![Risk Level](https://img.shields.io/badge/Risk-${result.riskLevel.toUpperCase()}-${color}?style=for-the-badge) 
![Score](https://img.shields.io/badge/Score-${result.riskScore}%2F100-${color}?style=for-the-badge)

### ${emoji} Risk Assessment
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
<sub>Generated by [ACIE](https://github.com/Sahil-Hub-Cloud/ACIE) — AI Change Impact Engine</sub>`;
}
