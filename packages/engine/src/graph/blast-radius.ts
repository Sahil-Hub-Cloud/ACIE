import { isEntryPoint } from '../scoring/entry-points';
import { detectService } from '../scoring/service-detection';
import { scoreRisk } from '../scoring/risk-scorer';
import { generateRecommendations, type ChangedSymbolInput } from '../scoring/recommendations';

export interface GraphEdge {
  sourceFile: string;
  targetFile: string;
  sourceSymbol?: string | null;
  targetSymbol?: string | null;
  edgeType?: 'imports' | 're-exports' | 'calls' | 'extends' | 'implements';
}

interface BFSNode {
  file: string;
  depth: number;
  symbols: string[];
  proofPath: ProofPathStep[];
}

export interface ProofPathStep {
  file: string;
  depth: number;
  symbol: string;
  viaSymbol?: string;
  edgeType: 'imports' | 're-exports';
}

export interface BlastRadiusInput {
  changedFiles: string[];
  changedSymbols: Array<{ filePath: string; symbolName: string; changeType: string }>;
  edges: GraphEdge[];
  testFiles?: string[];        // All test files in the repo
  codeowners?: string;         // CODEOWNERS file content
}

export interface TestSelectionResult {
  testFile: string;
  confidence: 'high' | 'medium' | 'low';
  reason: string;
}

export interface ReviewerSuggestion {
  file: string;
  reviewers: string[];
  source: 'codeowners' | 'git-blame';
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
    proofPath: ProofPathStep[];
  }>;
  totalImpactedFiles: number;
  entryPointsAffected: boolean;
  recommendations: string[];
  testSelection: TestSelectionResult[];      // NEW: Likely affected tests
  reviewerSuggestions: ReviewerSuggestion[]; // NEW: Suggested reviewers
}

const MAX_DEPTH = 10;
const TEST_FILE_PATTERNS = [
  /\.test\.(ts|tsx|js|jsx)$/,
  /\.spec\.(ts|tsx|js|jsx)$/,
  /__tests__\/.*\.(ts|tsx|js|jsx)$/,
  /tests?\/.*\.(ts|tsx|js|jsx)$/,
];

function _isTestFile(filePath: string): boolean {
  return TEST_FILE_PATTERNS.some(p => p.test(filePath));
}

function buildImporterMap(edges: GraphEdge[]): Map<string, Map<string, Array<{ sourceSymbol: string | null; targetSymbol: string | null; edgeType: string }>>> {
  const map = new Map<string, Map<string, Array<{ sourceSymbol: string | null; targetSymbol: string | null; edgeType: string }>>>();
  for (const edge of edges) {
    if (!map.has(edge.targetFile)) map.set(edge.targetFile, new Map());
    const targetMap = map.get(edge.targetFile)!;
    if (!targetMap.has(edge.sourceFile)) targetMap.set(edge.sourceFile, []);
    targetMap.get(edge.sourceFile)!.push({
      sourceSymbol: edge.sourceSymbol ?? null,
      targetSymbol: edge.targetSymbol ?? null,
      edgeType: edge.edgeType || 'imports',
    });
  }
  return map;
}

function extractTestSelection(
  changedFiles: string[],
  dependencyChain: BlastRadiusResult['dependencyChain'],
  testFiles: string[]
): TestSelectionResult[] {
  if (!testFiles || testFiles.length === 0) return [];

  // Collect all impacted files (changed + dependency chain)
  const impactedFiles = new Set<string>(changedFiles);
  for (const node of dependencyChain) {
    impactedFiles.add(node.file);
  }

  const results: TestSelectionResult[] = [];

  for (const testFile of testFiles) {
    let confidence: 'high' | 'medium' | 'low' = 'low';
    const reasons: string[] = [];

    // Direct test of changed file (high confidence)
    for (const changed of changedFiles) {
      if (testFile.includes(changed.replace(/\.(ts|tsx|js|jsx)$/, '')) ||
          changed.includes(testFile.replace(/\.(test|spec)\.(ts|tsx|js|jsx)$/, ''))) {
        confidence = 'high';
        reasons.push(`Direct test of changed file \`${changed}\``);
        break;
      }
    }

    // Test of impacted file (medium confidence)
    if (confidence === 'low') {
      for (const node of dependencyChain) {
        if (testFile.includes(node.file.replace(/\.(ts|tsx|js|jsx)$/, '')) ||
            node.file.includes(testFile.replace(/\.(test|spec)\.(ts|tsx|js|jsx)$/, ''))) {
          confidence = 'medium';
          reasons.push(`Tests impacted file \`${node.file}\` (depth ${node.depth})`);
          break;
        }
      }
    }

    // Same directory heuristic (low confidence)
    if (confidence === 'low') {
      for (const impacted of impactedFiles) {
        const impactedDir = impacted.substring(0, impacted.lastIndexOf('/'));
        const testDir = testFile.substring(0, testFile.lastIndexOf('/'));
        if (impactedDir && testDir && (impactedDir === testDir || testDir.startsWith(impactedDir + '/'))) {
          confidence = 'low';
          reasons.push(`Co-located in \`${impactedDir}\``);
          break;
        }
      }
    }

    // Same service heuristic (low confidence)
    if (confidence === 'low') {
      for (const impacted of impactedFiles) {
        const impactedService = detectService(impacted);
        const testService = detectService(testFile);
        if (impactedService === testService && impactedService !== 'core') {
          confidence = 'low';
          reasons.push(`Same service: \`${impactedService}\``);
          break;
        }
      }
    }

    if (reasons.length > 0) {
      results.push({
        testFile,
        confidence,
        reason: reasons.join('; '),
      });
    }
  }

  // Sort by confidence (high first), then by file name
  const confidenceOrder = { high: 0, medium: 1, low: 2 };
  results.sort((a, b) => confidenceOrder[a.confidence] - confidenceOrder[b.confidence] || a.testFile.localeCompare(b.testFile));
  return results;
}

function parseCodeowners(codeowners: string): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const line of codeowners.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const parts = trimmed.split(/\s+/);
    if (parts.length < 2) continue;
    const pattern = parts[0];
    const owners = parts.slice(1).map(o => o.replace(/^@/, ''));
    map.set(pattern, owners);
  }
  return map;
}

function matchCodeowners(filePath: string, codeownersMap: Map<string, string[]>): string[] {
  // Simple glob matching - in production use minimatch
  for (const [pattern, owners] of codeownersMap.entries()) {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    if (regex.test(filePath)) return owners;
  }
  return [];
}

function extractReviewerSuggestions(
  changedFiles: string[],
  codeowners?: string
): ReviewerSuggestion[] {
  const suggestions: ReviewerSuggestion[] = [];
  const seen = new Set<string>();

  if (codeowners) {
    const codeownersMap = parseCodeowners(codeowners);
    for (const file of changedFiles) {
      const owners = matchCodeowners(file, codeownersMap);
      if (owners.length > 0) {
        suggestions.push({ file, reviewers: owners, source: 'codeowners' });
        for (const o of owners) seen.add(o);
      }
    }
  }

  // Fallback: git blame would be implemented here
  // For now, we skip the git-blame fallback since it requires a git repo
  
  return suggestions;
}

export function calculateBlastRadius(input: BlastRadiusInput): BlastRadiusResult {
  const { changedFiles, changedSymbols, edges, testFiles, codeowners } = input;
  const visited = new Map<string, { depth: number; proofPath: ProofPathStep[] }>();
  const dependencyChain: BlastRadiusResult['dependencyChain'] = [];
  let entryPointsAffected = false;
  const serviceMap = new Map<string, Set<string>>();

  const queue: BFSNode[] = changedFiles.map(f => ({
    file: f,
    depth: 0,
    symbols: changedSymbols.filter(s => s.filePath === f).map(s => s.symbolName),
    proofPath: [],
  }));

  while (queue.length > 0) {
    const current = queue.shift()!;
    const visitedInfo = visited.get(current.file);
    
    if (visitedInfo && visitedInfo.depth < current.depth) continue;
    visited.set(current.file, { depth: current.depth, proofPath: current.proofPath });

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
        proofPath: current.proofPath,
      });
    }

    if (current.depth >= MAX_DEPTH) continue;

    const importerMap = buildImporterMap(edges);
    const importers = importerMap.get(current.file);
    if (!importers) continue;

    for (const [sourceFile, symbolInfos] of importers.entries()) {
      if (!visited.has(sourceFile) || visited.get(sourceFile)!.depth > current.depth + 1) {
        for (const symbolInfo of symbolInfos) {
          const newProofPath = [...current.proofPath];
          if (symbolInfo.targetSymbol || symbolInfo.sourceSymbol) {
            newProofPath.push({
              file: sourceFile,
              depth: current.depth + 1,
              symbol: symbolInfo.targetSymbol || symbolInfo.sourceSymbol || '*',
              viaSymbol: current.symbols[0] || '*',
              edgeType: symbolInfo.edgeType as 'imports' | 're-exports',
            });
          }
          
          queue.push({
            file: sourceFile,
            depth: current.depth + 1,
            symbols: current.symbols,
            proofPath: newProofPath,
          });
        }
      }
    }
  }

  for (const { file } of dependencyChain) {
    const service = detectService(file);
    if (!serviceMap.has(service)) serviceMap.set(service, new Set());
    if (isEntryPoint(file)) serviceMap.get(service)!.add(file);
  }

  const impactedServices: Array<{ name: string; entryPoints: string[] }> = [];
  for (const entry of Array.from(serviceMap.entries())) {
    const [name, eps] = entry;
    impactedServices.push({ name, entryPoints: Array.from(eps) });
  }

  const maxDepth = dependencyChain.reduce((max, n) => Math.max(max, n.depth), 0);

  const { score, level } = scoreRisk({
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
    changedSymbols: changedSymbols.map(s => ({ symbolName: s.symbolName, changeType: s.changeType as ChangedSymbolInput['changeType'] })),
  });

  // NEW: Test selection
  const testSelection = testFiles ? extractTestSelection(changedFiles, dependencyChain, testFiles) : [];

  // NEW: Reviewer suggestions
  const reviewerSuggestions = codeowners ? extractReviewerSuggestions(changedFiles, codeowners) : [];

  return {
    riskScore: score,
    riskLevel: level,
    impactedServices,
    dependencyChain,
    totalImpactedFiles: dependencyChain.length,
    entryPointsAffected,
    recommendations,
    testSelection,
    reviewerSuggestions,
  };
}