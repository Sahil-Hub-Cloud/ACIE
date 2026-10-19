import type { RiskLevel } from '@acie/shared';

export interface ChangedSymbolInput {
  symbolName: string;
  changeType: 'added' | 'modified' | 'removed';
}

export function generateRecommendations(params: {
  riskLevel: RiskLevel;
  entryPointsAffected: boolean;
  impactedServicesCount: number;
  changedSymbols: ChangedSymbolInput[];
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