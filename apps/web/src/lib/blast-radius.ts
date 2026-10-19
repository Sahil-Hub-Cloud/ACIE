import {
  calculateBlastRadius,
  type BlastRadiusResult,
  type BlastRadiusInput as _BlastRadiusInput,
  type GraphEdge,
  type ProofPathStep,
} from '@acie/engine/graph';
import { ACIE_COMMENT_MARKER } from '@acie/engine/scoring';

// Re-export types from engine
export { type BlastRadiusResult, type BlastRadiusInput, type GraphEdge, type ProofPathStep } from '@acie/engine/graph';

/**
 * Hidden marker used to find and update our own PR comment instead of
 * posting a fresh one on every push to the branch.
 */
export { ACIE_COMMENT_MARKER };

/**
 * Calculate blast radius using BFS on an in-memory graph.
 * Thin wrapper around @acie/engine's calculateBlastRadius.
 */
export function calculateBlastRadiusInMemory(
  changedFiles: string[],
  changedSymbols: Array<{ filePath: string; symbolName: string; changeType: string }>,
  edges: GraphEdge[],
  testFiles?: string[],
  codeowners?: string | null,
): BlastRadiusResult {
  return calculateBlastRadius({ changedFiles, changedSymbols, edges, testFiles, codeowners: codeowners ?? undefined });
}

/**
 * Format proof path as a readable string for the PR comment.
 */
function formatProofPath(proofPath: ProofPathStep[]): string {
  if (proofPath.length === 0) return '';
  
  return proofPath.map((step, i) => {
    const indent = '  '.repeat(i + 1);
    const via = step.viaSymbol ? ` (via \`${step.viaSymbol}\`)` : '';
    const edgeIcon = step.edgeType === 're-exports' ? '↳' : '→';
    return `${indent}${edgeIcon} \`${step.file}\` imports \`${step.symbol}\`${via} [${step.edgeType}]`;
  }).join('\n');
}

/**
 * Format test selection as a markdown table.
 */
function formatTestSelection(testSelection: BlastRadiusResult['testSelection']): string {
  if (!testSelection || testSelection.length === 0) {
    return '- No test files found or matched (heuristic)';
  }
  
  const lines = testSelection.slice(0, 15).map(t => {
    const confidenceEmoji = t.confidence === 'high' ? '🔴' : t.confidence === 'medium' ? '🟡' : '🟢';
    return `- ${confidenceEmoji} \`${t.testFile}\` — **${t.confidence}** confidence: ${t.reason}`;
  });
  
  if (testSelection.length > 15) {
    lines.push(`- ... and ${testSelection.length - 15} more test files`);
  }
  
  return lines.join('\n');
}

/**
 * Format reviewer suggestions as a markdown list.
 */
function formatReviewerSuggestions(reviewerSuggestions: BlastRadiusResult['reviewerSuggestions']): string {
  if (!reviewerSuggestions || reviewerSuggestions.length === 0) {
    return '- No CODEOWNERS or reviewers matched';
  }
  
  const lines = reviewerSuggestions.map(r => {
    const sourceLabel = r.source === 'codeowners' ? 'CODEOWNERS' : 'git-blame';
    return `- \`${r.file}\`: @${r.reviewers.join(', @')} (${sourceLabel})`;
  });
  
  return lines.join('\n');
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

  const chainList = result.dependencyChain.slice(0, 10).map(n => {
    const base = `  ${' '.repeat(n.depth * 2)}- \`${n.file}\` (depth: ${n.depth})`;
    const symbols = n.symbols.length > 0 ? ` [symbols: ${n.symbols.join(', ')}]` : '';
    const proofPathStr = n.proofPath && n.proofPath.length > 0 ? `\n${formatProofPath(n.proofPath)}` : '';
    return `${base}${symbols}${proofPathStr}`;
  }).join('\n');

  const recsList = result.recommendations.map(r => `- ${r}`).join('\n');
  
  const testSelectionList = formatTestSelection(result.testSelection);
  const reviewerSuggestionsList = formatReviewerSuggestions(result.reviewerSuggestions);

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

### 🔗 Dependency Chain with Proof Paths (top 10)
${chainList || '  - No downstream dependencies found'}

### 🧪 Test Selection (heuristic — "likely affected tests")
${testSelectionList}

### 👥 Suggested Reviewers
${reviewerSuggestionsList}

### 💡 Recommendations
${recsList}

---
<sub>Generated by [ACIE](https://github.com/Sahil-Hub-Cloud/ACIE) — AI Change Impact Engine</sub>`;
}