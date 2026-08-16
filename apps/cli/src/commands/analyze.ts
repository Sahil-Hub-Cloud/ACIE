import { Command } from 'commander';
import * as path from 'path';
import { getChangedFilesFromPR, getFilePatch } from '../utils/git';
import { analyzeChangedFiles } from '../core/diff-analyzer';
import { calculateBlastRadius, formatPRComment } from '../core/blast-radius';
import { getDb, closeDb, AnalysisQueries } from '../utils/db';
import { logger, formatRisk, formatScore } from '../utils/logger';

export const analyzeCommand = new Command('analyze')
  .description('Analyze git changes or a PR blast radius')
  .option('-b, --base <branch>', 'Base branch/SHA to compare against', 'main')
  .option('-h, --head <branch>', 'Head branch/SHA to compare', 'HEAD')
  .option('-d, --db-path <path>', 'Database file path', './data/acie.db')
  .option('--pr <number>', 'Associated PR number', '0')
  .option('--pr-url <url>', 'Associated PR URL', '')
  .option('--repo-id <id>', 'Repository ID in database', '1')
  .action(async (options) => {
    logger.header('ACIE Analyze');

    const cwd = process.cwd();
    const dbPath = path.resolve(options.dbPath);

    logger.info(`Analyzing changes: ${options.base} ... ${options.head}`);
    logger.info(`Database: ${dbPath}`);
    logger.dim('');

    try {
      const db = getDb(dbPath);

      // Get files changed
      const files = await getChangedFilesFromPR(cwd, options.base, options.head);
      if (files.length === 0) {
        logger.success('No source files changed.');
        return;
      }

      logger.info(`Found ${files.length} changed source files. Fetching patches...`);

      // Populate patches for each file
      for (const file of files) {
        file.patch = await getFilePatch(cwd, file.filename, options.base, options.head);
      }

      // Analyze symbols changed
      logger.info('Analyzing diff for changed exports...');
      const changedSymbols = analyzeChangedFiles(files);

      logger.info(`Extracted ${changedSymbols.length} changed exports.`);

      // Compute blast radius
      logger.info('Calculating blast propagation...');
      const result = await calculateBlastRadius(changedSymbols, db);

      // Print CLI output
      logger.dim('');
      logger.bold('=== BLAST RADIUS REPORT ===');
      console.log(`Risk Level:           ${formatRisk(result.riskLevel)}`);
      console.log(`Risk Score:           ${formatScore(result.riskScore)}/100`);
      console.log(`Changed Files:        ${files.length}`);
      console.log(`Impacted Files:       ${result.totalImpactedFiles}`);
      console.log(`Impacted Services:    ${result.impactedServices.length}`);
      console.log(`Entry Points Affected: ${result.entryPointsAffected ? 'Yes' : 'No'}`);

      if (result.impactedServices.length > 0) {
        logger.dim('');
        logger.bold('Impacted Services:');
        for (const s of result.impactedServices) {
          console.log(`  - ${s.name} (${s.entryPoints.length} entry points affected)`);
        }
      }

      if (result.dependencyChain.length > 0) {
        logger.dim('');
        logger.bold('Dependency Chain (top 5):');
        for (const node of result.dependencyChain.slice(0, 5)) {
          console.log(`  ${'  '.repeat(node.depth)}└─ ${node.file}`);
        }
      }

      logger.dim('');
      logger.bold('Recommendations:');
      for (const rec of result.recommendations) {
        console.log(`- ${rec}`);
      }

      // Save to database
      logger.dim('');
      logger.info('Saving analysis to database...');
      AnalysisQueries.insert(db, {
        repoId: parseInt(options.repoId, 10),
        prNumber: parseInt(options.pr, 10),
        prUrl: options.prUrl || '#',
        prTitle: `Analysis of ${options.head}`,
        prAuthor: 'CLI',
        riskScore: result.riskScore,
        riskLevel: result.riskLevel,
        changedFiles: files,
        changedSymbols: changedSymbols,
        impactedServices: result.impactedServices.map(s => s.name),
        blastRadius: result,
        recommendations: result.recommendations,
      });

      logger.success('Analysis completed successfully!');

    } catch (err) {
      logger.error(`Analysis failed: ${(err as Error).message}`);
      process.exit(1);
    } finally {
      closeDb();
    }
  });
