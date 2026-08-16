import { Command } from 'commander';
import * as path from 'path';
import * as fs from 'fs';
import { logger } from '../utils/logger';

export const initCommand = new Command('init')
  .description('Initialize ACIE in the current repository')
  .option('-d, --db-path <path>', 'Database file path', './data/acie.db')
  .action(async (options) => {
    logger.header('ACIE Init');

    const cwd = process.cwd();
    const acieConfigPath = path.join(cwd, '.acie.json');

    if (fs.existsSync(acieConfigPath)) {
      logger.warn('.acie.json already exists. Run `acie index` to rebuild the graph.');
      return;
    }

    const config = {
      version: '2.0.0',
      dbPath: options.dbPath,
      ignore: ['node_modules', 'dist', '.git', 'coverage', '.next', 'build'],
      languages: ['typescript', 'javascript', 'python', 'go'],
      createdAt: new Date().toISOString(),
    };

    fs.writeFileSync(acieConfigPath, JSON.stringify(config, null, 2));

    // Create data directory
    const dataDir = path.dirname(path.resolve(cwd, options.dbPath));
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Add .acie.json to .gitignore
    const gitignorePath = path.join(cwd, '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const gitignore = fs.readFileSync(gitignorePath, 'utf-8');
      if (!gitignore.includes('data/acie.db')) {
        fs.appendFileSync(gitignorePath, '\n# ACIE\ndata/\n');
      }
    }

    logger.success('ACIE initialized!');
    logger.info(`Config: ${acieConfigPath}`);
    logger.info(`Database: ${options.dbPath}`);
    logger.dim('');
    logger.dim('Next steps:');
    logger.dim('  1. acie index          — Build the dependency graph');
    logger.dim('  2. acie analyze <url>  — Analyze a PR');
    logger.dim('  3. acie serve          — Start the local API server');
  });
