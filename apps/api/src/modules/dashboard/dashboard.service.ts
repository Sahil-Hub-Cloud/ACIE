import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class DashboardService {
  constructor(private dbService: DatabaseService) {}

  async getOverview() {
    // 1. Core stats
    const repos = this.dbService.get<{ count: number }>('SELECT COUNT(*) as count FROM repos');
    const analyses = this.dbService.get<{ count: number }>('SELECT COUNT(*) as count FROM analyses');
    const highRisk = this.dbService.get<{ count: number }>("SELECT COUNT(*) as count FROM analyses WHERE risk_level IN ('high', 'critical')");
    
    // 2. Recent analyses (last 10)
    const recentRows = this.dbService.all(`
      SELECT a.id, a.pr_number, a.pr_url, a.risk_score, a.risk_level, a.changed_files, a.impacted_services, a.created_at, r.name as repo_name
      FROM analyses a
      JOIN repos r ON r.id = a.repo_id
      ORDER BY a.created_at DESC
      LIMIT 10
    `);
    const recentAnalyses = recentRows.map(row => ({
      ...row,
      changed_files: row.changed_files ? JSON.parse(row.changed_files) : [],
      impacted_services: row.impacted_services ? JSON.parse(row.impacted_services) : [],
    }));

    // 3. Risk chart trends (last 30 days)
    const trendRows = this.dbService.all<{ date: string; avgScore: number; count: number }>(`
      SELECT strftime('%Y-%m-%d', created_at) as date, AVG(risk_score) as avgScore, COUNT(*) as count
      FROM analyses
      GROUP BY date
      ORDER BY date DESC
      LIMIT 30
    `);
    const riskChart = trendRows.reverse().map(row => ({
      date: row.date,
      avgScore: Math.round(row.avgScore),
      count: row.count,
    }));

    // 4. Top risky files (most imported target files)
    const riskyFiles = this.dbService.all<{ filePath: string; importCount: number }>(`
      SELECT target_file as filePath, COUNT(*) as importCount
      FROM edges
      GROUP BY target_file
      ORDER BY importCount DESC
      LIMIT 10
    `);

    return {
      stats: {
        totalRepos: repos?.count || 0,
        totalAnalyses: analyses?.count || 0,
        highRiskPRs: highRisk?.count || 0,
        incidentsPrevented: highRisk?.count || 0, // simple proxy
      },
      recentAnalyses,
      riskChart,
      topRiskyFiles: riskyFiles,
    };
  }
}
