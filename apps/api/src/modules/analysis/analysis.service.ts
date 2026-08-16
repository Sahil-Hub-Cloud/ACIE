import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { calculateBlastRadius } from '../../../../cli/src/core/blast-radius';
import type { ChangedSymbol } from '@acie/shared';

@Injectable()
export class AnalysisService {
  constructor(private dbService: DatabaseService) {}

  async findAll() {
    const rows = this.dbService.all('SELECT * FROM analyses ORDER BY created_at DESC');
    return rows.map(r => this.deserializeAnalysis(r));
  }

  async findOne(id: number) {
    const row = this.dbService.get('SELECT * FROM analyses WHERE id = ?', id);
    if (!row) {
      throw new NotFoundException('Analysis record not found');
    }
    return this.deserializeAnalysis(row);
  }

  async getStats() {
    const total = this.dbService.get<{ count: number }>('SELECT COUNT(*) as count FROM analyses');
    const high = this.dbService.get<{ count: number }>("SELECT COUNT(*) as count FROM analyses WHERE risk_level = 'high'");
    const critical = this.dbService.get<{ count: number }>("SELECT COUNT(*) as count FROM analyses WHERE risk_level = 'critical'");
    const avgScore = this.dbService.get<{ avg: number }>('SELECT AVG(risk_score) as avg FROM analyses');

    const trendRows = this.dbService.all<{ date: string; avgScore: number; count: number }>(`
      SELECT strftime('%Y-%m-%d', created_at) as date, AVG(risk_score) as avgScore, COUNT(*) as count
      FROM analyses
      GROUP BY date
      ORDER BY date DESC
      LIMIT 30
    `);

    return {
      totalAnalyses: total?.count || 0,
      highRiskCount: high?.count || 0,
      criticalRiskCount: critical?.count || 0,
      avgRiskScore: Math.round(avgScore?.avg || 0),
      incidentsPrevented: (high?.count || 0) + (critical?.count || 0),
      riskTrend: trendRows.reverse(),
    };
  }

  async preview(changedSymbols: ChangedSymbol[]) {
    const db = this.dbService.getDb();
    const result = await calculateBlastRadius(changedSymbols, db);
    return {
      riskScore: result.riskScore,
      riskLevel: result.riskLevel,
      impactedServices: result.impactedServices,
      dependencyChain: result.dependencyChain,
      totalImpactedFiles: result.totalImpactedFiles,
      entryPointsAffected: result.entryPointsAffected,
      recommendations: result.recommendations,
    };
  }

  private deserializeAnalysis(row: any) {
    return {
      ...row,
      changed_files: row.changed_files ? JSON.parse(row.changed_files) : [],
      impacted_services: row.impacted_services ? JSON.parse(row.impacted_services) : [],
      blast_radius: row.blast_radius ? JSON.parse(row.blast_radius) : null,
      recommendations: row.recommendations ? JSON.parse(row.recommendations) : [],
    };
  }
}
