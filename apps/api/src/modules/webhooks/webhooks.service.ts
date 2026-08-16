import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Octokit } from '@octokit/rest';
import * as crypto from 'crypto';
import * as path from 'path';
import { DatabaseService } from '../../database/database.service';
import { analyzeChangedFiles } from '../../../../cli/src/core/diff-analyzer';
import { calculateBlastRadius, formatPRComment } from '../../../../cli/src/core/blast-radius';
import { ReposService } from '../repos/repos.service';
import type { ChangedFile } from '@acie/shared';

@Injectable()
export class WebhooksService {
  private octokit: Octokit;

  constructor(
    private configService: ConfigService,
    private dbService: DatabaseService,
    private reposService: ReposService
  ) {
    const githubToken = this.configService.get<string>('GITHUB_TOKEN') || process.env.GITHUB_TOKEN;
    this.octokit = new Octokit({ auth: githubToken });
  }

  async verifySignature(signature: string, payload: any): Promise<boolean> {
    const secret = this.configService.get<string>('GITHUB_WEBHOOK_SECRET') || process.env.GITHUB_WEBHOOK_SECRET;
    if (!secret) return true; // Skip verification if secret not set

    const hmac = crypto.createHmac('sha256', secret);
    const digest = 'sha256=' + hmac.update(JSON.stringify(payload)).digest('hex');
    
    return signature === digest;
  }

  async handleGithubWebhook(event: string, payload: any) {
    if (event !== 'pull_request') {
      return { status: 'ignored', reason: `Event ${event} is not pull_request` };
    }

    const action = payload.action;
    if (action !== 'opened' && action !== 'synchronize') {
      return { status: 'ignored', reason: `Action ${action} is not opened/synchronize` };
    }

    const pr = payload.pull_request;
    const repoPayload = payload.repository;
    const installationId = payload.installation?.id;

    if (!pr || !repoPayload) {
      throw new BadRequestException('Invalid payload schema');
    }

    const ownerName = repoPayload.owner.login;
    const repoName = repoPayload.name;
    const fullName = repoPayload.full_name;

    // 1. Get or Register Repository
    let repo = this.dbService.get('SELECT * FROM repos WHERE github_id = ?', repoPayload.id);
    if (!repo) {
      repo = await this.reposService.addRepo({
        githubId: repoPayload.id,
        name: repoName,
        owner: ownerName,
        url: repoPayload.html_url,
        language: repoPayload.language || 'TypeScript',
      });
    }

    // 2. Fetch changed files and diff patches from GitHub API
    const prNumber = pr.number;
    const baseBranch = pr.base.ref;
    const headBranch = pr.head.ref;
    
    try {
      // Get list of changed files in the PR
      const filesResponse = await this.octokit.pulls.listFiles({
        owner: ownerName,
        repo: repoName,
        pull_number: prNumber,
      });

      const changedFiles: ChangedFile[] = filesResponse.data.map(f => ({
        filename: f.filename,
        status: f.status as any,
        additions: f.additions,
        deletions: f.deletions,
        patch: f.patch,
      })).filter(f => f.filename.match(/\.(ts|tsx|js|jsx|py|go)$/));

      if (changedFiles.length === 0) {
        return { status: 'skipped', reason: 'No source code files modified' };
      }

      // 3. Extract changed symbols from diff patches
      const changedSymbols = analyzeChangedFiles(changedFiles);

      // 4. Calculate blast radius and risk score
      const db = this.dbService.getDb();
      const blastRadius = await calculateBlastRadius(changedSymbols, db);

      // 5. Post markdown report as PR comment
      const prComment = formatPRComment(prNumber, changedFiles.map(f => f.filename), blastRadius);
      
      await this.octokit.issues.createComment({
        owner: ownerName,
        repo: repoName,
        issue_number: prNumber,
        body: prComment,
      });

      // 6. Store analysis report in SQLite
      this.dbService.run(`
        INSERT INTO analyses (repo_id, pr_number, pr_url, risk_score, risk_level, changed_files, impacted_services, blast_radius)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
        repo.id,
        prNumber,
        pr.html_url,
        blastRadius.riskScore,
        blastRadius.riskLevel,
        JSON.stringify(changedFiles),
        JSON.stringify(blastRadius.impactedServices.map(s => s.name)),
        JSON.stringify(blastRadius)
      );

      // Trigger automatic update of nodes/edges for modified files (since PR updates graph representation)
      // This is background sync.
      this.updateGraphFiles(ownerName, repoName, pr.head.sha, changedFiles);

      return {
        status: 'success',
        riskLevel: blastRadius.riskLevel,
        riskScore: blastRadius.riskScore,
      };

    } catch (err) {
      console.error('Webhook processing failed:', err);
      throw new Error(`GitHub app integration failed: ${(err as Error).message}`);
    }
  }

  // Asynchronously updates the indexed database nodes/edges for modified files
  private async updateGraphFiles(owner: string, repo: string, ref: string, files: ChangedFile[]) {
    // Only update added/modified files
    const targets = files.filter(f => f.status === 'added' || f.status === 'modified');
    
    for (const file of targets) {
      try {
        const contentRes = await this.octokit.repos.getContent({
          owner,
          repo,
          path: file.filename,
          ref,
        });

        if ('content' in contentRes.data) {
          const content = Buffer.from(contentRes.data.content, 'base64').toString('utf-8');
          
          // Import dynamic update helper or run it locally
          const relativePath = file.filename;
          
          // Delete old symbols
          this.dbService.run('DELETE FROM nodes WHERE file_path = ?', relativePath);
          this.dbService.run('DELETE FROM edges WHERE source_file = ?', relativePath);

          // For simplicity, we can do a quick regex parse and insert in SQLite
          const exportPatterns = [
            { regex: /export\s+(?:default\s+)?(?:async\s+)?function\s+(\w+)/, kind: 'function' },
            { regex: /export\s+(?:default\s+)?class\s+(\w+)/, kind: 'class' },
            { regex: /export\s+interface\s+(\w+)/, kind: 'interface' },
            { regex: /export\s+type\s+(\w+)/, kind: 'type' },
            { regex: /export\s+(?:const|let|var)\s+(\w+)/, kind: 'const' },
          ];

          const lines = content.split('\n');
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            for (const { regex, kind } of exportPatterns) {
              const match = line.match(regex);
              if (match && match[1]) {
                this.dbService.run(
                  'INSERT INTO nodes (file_path, symbol_name, symbol_kind, line_number, is_exported) VALUES (?, ?, ?, ?, 1)',
                  relativePath, match[1], kind, i + 1
                );
              }
            }
          }

          // Parse imports
          const importRegex = /(?:import|from)\s+['"]([^'"]+)['"]/g;
          let match: RegExpExecArray | null;
          while ((match = importRegex.exec(content)) !== null) {
            const specifier = match[1];
            if (specifier.startsWith('.')) {
              // Resolve relative path roughly
              const resolved = path.join(path.dirname(relativePath), specifier).replace(/\\/g, '/');
              this.dbService.run(
                'INSERT INTO edges (source_file, target_file, edge_type) VALUES (?, ?, ?)',
                relativePath, resolved, 'imports'
              );
            }
          }
        }
      } catch (err) {
        // Skip silently on file update errors
      }
    }
  }
}
