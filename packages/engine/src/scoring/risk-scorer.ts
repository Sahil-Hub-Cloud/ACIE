import type { RiskLevel } from '@acie/shared';

export const RISK_WEIGHTS = {
  entryPointAffected: 35,
  perImpactedService: 10,
  perDepthLevel: 2,
  perImpactedFile: 1,
  maxFileScore: 20,
  criticalThreshold: 76,
  highThreshold: 51,
  mediumThreshold: 26,
} as const;

export function scoreRisk(params: {
  impactedFilesCount: number;
  impactedServicesCount: number;
  entryPointsAffected: boolean;
  maxDepth: number;
  changedSymbolsCount: number;
}): { score: number; level: RiskLevel } {
  let score = 0;

  if (params.entryPointsAffected) {
    score += RISK_WEIGHTS.entryPointAffected;
  }

  score += Math.min(params.impactedServicesCount * RISK_WEIGHTS.perImpactedService, 30);
  score += Math.min(params.maxDepth * RISK_WEIGHTS.perDepthLevel, 10);
  score += Math.min(params.impactedFilesCount * RISK_WEIGHTS.perImpactedFile, RISK_WEIGHTS.maxFileScore);
  score += Math.min(params.changedSymbolsCount, 5);

  score = Math.min(score, 100);

  return { score, level: scoreToLevel(score) };
}

export function scoreToLevel(score: number): RiskLevel {
  if (score >= RISK_WEIGHTS.criticalThreshold) return 'critical';
  if (score >= RISK_WEIGHTS.highThreshold) return 'high';
  if (score >= RISK_WEIGHTS.mediumThreshold) return 'medium';
  return 'low';
}

export function formatScore(score: number): { score: string; color: string; emoji: string } {
  if (score >= RISK_WEIGHTS.criticalThreshold) return { score: score.toString(), color: 'ff0000', emoji: '🚨' };
  if (score >= RISK_WEIGHTS.highThreshold) return { score: score.toString(), color: 'ff4444', emoji: '🔴' };
  if (score >= RISK_WEIGHTS.mediumThreshold) return { score: score.toString(), color: 'ff8800', emoji: '⚠️' };
  return { score: score.toString(), color: '00cc44', emoji: '✅' };
}