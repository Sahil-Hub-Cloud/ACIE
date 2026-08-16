import { Command } from 'commander';
import * as path from 'path';
import { buildGraph } from '../core/graph-builder';
import { getDb, closeDb } from '../utils/db';
import { logger } from '../utils/logger';

export const indexCommand = new Command('index')
  .description('Build or rebuild the dependency graph for the current repository')
  .argument('[root]', 'Root directory to index', '.')
  .option('-d, --db-path <path>', 'Database file path', './data/acie.db')
  .option('--stats', 'Show graph statistics after indexing')
  .action(async (root: string, options) => {
    logger.header('ACIE Index');

    const rootPath = path.resolve(root);
    const dbPath = path.resolve(options.dbPath);

    logger.info(`Root: ${rootPath}`);
    logger.info(`Database: ${dbPath}`);
    logger.dim('');

    const start = Date.now();

    try {
      await buildGraph(rootPath, dbPath);

      const elapsed = ((Date.now() - start) / 1000).toFixed(1);
      logger.success(`Graph built in ${elapsed}s`);

      if (options.stats) {
        const db = getDb(dbPath);
        const nodeCount = (db.prepare('SELECT COUNT(*) as c FROM nodes').get() as { c: number }).c;
        const edgeCount = (db.prepare('SELECT COUNT(*) as c FROM edges').get() as { c: number }).c;
        const fileCount = (db.prepare('SELECT COUNT(DISTINCT file_path) as c FROM nodes').get() as { c: number }).c;
        const exportedCount = (db.prepare('SELECT COUNT(*) as c FROM nodes WHERE is_exported = 1').get() as { c: number }).c;

        logger.dim('');
        logger.header('Graph Statistics');
        console.table([
          { Metric: 'Source Files', Value: fileCount },
          { Metric: 'Total Symbols', Value: nodeCount },
          { Metric: 'Exported Symbols', Value: exportedCount },
          { Metric: 'Import Edges', Value: edgeCount },
        ]);
      }
    } catch (err) {
      logger.error(`Graph build failed: ${(err as Error).message}`);
      process.exit(1);
    } finally {
      closeDb();
    }
  });
