import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { buildGraph } from '../../../../cli/src/core/graph-builder';
import * as path from 'path';

@Injectable()
export class ReposService {
  constructor(private dbService: DatabaseService) {}

  async findAll() {
    return this.dbService.all('SELECT * FROM repos ORDER BY name ASC');
  }

  async findOne(id: number) {
    const repo = this.dbService.get('SELECT * FROM repos WHERE id = ?', id);
    if (!repo) {
      throw new NotFoundException('Repository not found');
    }
    return repo;
  }

  async addRepo(data: { githubId: number; name: string; owner: string; url: string; language: string; isMonorepo?: boolean; monorepoTool?: string }) {
    // Check if repo already registered
    const existing = this.dbService.get('SELECT * FROM repos WHERE github_id = ?', data.githubId);
    if (existing) return existing;

    const result = this.dbService.run(
      `INSERT INTO repos (github_id, name, owner, url, language, is_monorepo, monorepo_tool)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      data.githubId,
      data.name,
      data.owner,
      data.url,
      data.language,
      data.isMonorepo ? 1 : 0,
      data.monorepoTool || null
    );

    return this.findOne(result.lastInsertRowid as number);
  }

  async removeRepo(id: number) {
    const repo = await this.findOne(id);
    this.dbService.run('DELETE FROM repos WHERE id = ?', id);
    return { success: true, message: `Removed repo: ${repo.name}` };
  }

  async triggerIndexing(id: number) {
    const repo = await this.findOne(id);
    
    // For demo/dev purposes, we index the current workspace as the repository root
    const repoRoot = path.resolve(process.cwd(), '../../..'); 
    const dbPath = this.dbService.getDb().name;

    // Run indexing asynchronously so we don't block the HTTP request
    logger.info(`Asynchronously starting graph index for: ${repo.name} at ${repoRoot}`);
    buildGraph(repoRoot, dbPath)
      .then(() => {
        this.dbService.run(
          "UPDATE repos SET last_indexed_at = datetime('now') WHERE id = ?",
          id
        );
        logger.success(`Asynchronous graph indexing completed for: ${repo.name}`);
      })
      .catch((err) => {
        logger.error(`Asynchronous graph indexing failed for: ${repo.name}: ${err.message}`);
      });

    return { success: true, message: 'Indexing started in background' };
  }

  async getGraph(id: number) {
    await this.findOne(id); // validates it exists
    
    const nodes = this.dbService.all('SELECT * FROM nodes');
    const edges = this.dbService.all('SELECT * FROM edges');
    const services = this.dbService.all('SELECT * FROM services');

    return { nodes, edges, services };
  }
}

// Simple Logger placeholder since we import buildGraph which expects logger
const logger = {
  info: (msg: string) => console.log(`[API-Info] ${msg}`),
  success: (msg: string) => console.log(`[API-Success] ${msg}`),
  error: (msg: string) => console.error(`[API-Error] ${msg}`),
};
