import type { RiskLevel } from '@acie/shared';

// Entry point patterns — files that are "termination points" for blast radius
const ENTRY_POINT_PATTERNS = [
  /\.controller\.(ts|js)$/,
  /\.route\.(ts|js)$/,
  /\/pages\/.*\.(ts|tsx|js|jsx)$/,
  /\/app\/.*\/page\.(ts|tsx)$/,
  /\/app\/.*\/route\.(ts|js)$/,
  /server\.(ts|js)$/,
  /main\.(ts|js)$/,
  /index\.(ts|js)$/, // Entry points
  /handler\.(ts|js)$/, // Serverless functions
  /lambda\.(ts|js)$/,
];

// Risk multipliers
const RISK_WEIGHTS = {
  entryPointAffected: 35,
  perImpactedService: 10,
  perDepthLevel: 2,
  perImpactedFile: 1,
  maxFileScore: 20, // Cap file count contribution
  criticalThreshold: 76,
  highThreshold: 51,
  mediumThreshold: 26,
};

export function scoreRisk(params: {
  impactedFilesCount: number;
  impactedServicesCount: number;
  entryPointsAffected: boolean;
  maxDepth: number;
  changedSymbolsCount: number;
}): { score: number; level: RiskLevel } {
  let score = 0;

  // Base: entry points affected is highest risk signal
  if (params.entryPointsAffected) {
    score += RISK_WEIGHTS.entryPointAffected;
  }

  // Services affected
  score += Math.min(params.impactedServicesCount * RISK_WEIGHTS.perImpactedService, 30);

  // Depth of propagation
  score += Math.min(params.maxDepth * RISK_WEIGHTS.perDepthLevel, 10);

  // Raw file count
  score += Math.min(params.impactedFilesCount * RISK_WEIGHTS.perImpactedFile, RISK_WEIGHTS.maxFileScore);

  // Changed symbols count adds slight score
  score += Math.min(params.changedSymbolsCount, 5);

  score = Math.min(score, 100);

  const level = scoreToLevel(score);
  return { score, level };
}

export function scoreToLevel(score: number): RiskLevel {
  if (score >= RISK_WEIGHTS.criticalThreshold) return 'critical';
  if (score >= RISK_WEIGHTS.highThreshold) return 'high';
  if (score >= RISK_WEIGHTS.mediumThreshold) return 'medium';
  return 'low';
}

export function isEntryPoint(filePath: string): boolean {
  return ENTRY_POINT_PATTERNS.some(pattern => pattern.test(filePath));
}

export function detectService(filePath: string): string {
  // Monorepo: service = first directory segment under apps/ or packages/
  const appsMatch = filePath.match(/(?:apps|packages)\/([^/]+)\//);
  if (appsMatch) return appsMatch[1];

  // Feature-based: src/features/[name]/
  const featureMatch = filePath.match(/features\/([^/]+)\//);
  if (featureMatch) return featureMatch[1];

  // Module-based: src/modules/[name]/
  const moduleMatch = filePath.match(/modules\/([^/]+)\//);
  if (moduleMatch) return moduleMatch[1];

  // Domain-based: src/[domain]/[name]/
  const domainMatch = filePath.match(/src\/([^/]+)\//);
  if (domainMatch) return domainMatch[1];

  return 'core';
}

export function generateRecommendations(params: {
  riskLevel: RiskLevel;
  entryPointsAffected: boolean;
  impactedServicesCount: number;
  changedSymbols: Array<{ symbolName: string; changeType: string }>;
}): string[] {
  const recs: string[] = [];
  const removedExports = params.changedSymbols.filter(s => s.changeType === 'removed');
  const modifiedExports = params.changedSymbols.filter(s => s.changeType === 'modified');

  if (removedExports.length > 0) {
    recs.push(`⚠️ Removed exports detected: ${removedExports.map(s => `\`${s.symbolName}\``).join(', ')}. All downstream importers will break.`);
    recs.push('📋 Run `acie analyze` to find all files that import these symbols before merging.');
  }

  if (modifiedExports.length > 0) {
    recs.push(`🔄 Modified exports: ${modifiedExports.map(s => `\`${s.symbolName}\``).join(', ')}. Verify interface compatibility.`);
  }

  if (params.entryPointsAffected) {
    recs.push('🚨 Entry points (routes/controllers/handlers) are in the blast radius — runtime behavior may change.');
    recs.push('🧪 Run integration tests against all affected endpoints before merging.');
  }

  if (params.impactedServicesCount > 2) {
    recs.push(`📦 ${params.impactedServicesCount} services are impacted — consider a coordinated deployment strategy.`);
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
