import { Command } from 'commander';
import * as http from 'http';
import * as path from 'path';
import { getDb, closeDb } from '../utils/db';
import { logger } from '../utils/logger';

export const serveCommand = new Command('serve')
  .description('Start a local API server to query the dependency graph')
  .option('-p, --port <number>', 'Port to listen on', '3002')
  .option('-d, --db-path <path>', 'Database file path', './data/acie.db')
  .action((options) => {
    logger.header('ACIE Serve');

    const port = parseInt(options.port, 10);
    const dbPath = path.resolve(options.dbPath);

    logger.info(`Port: ${port}`);
    logger.info(`Database: ${dbPath}`);
    logger.dim('');

    try {
      const db = getDb(dbPath);

      const server = http.createServer((req, res) => {
        // Enable CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.writeHead(204);
          res.end();
          return;
        }

        const url = new URL(req.url || '', `http://localhost:${port}`);

        // Routing
        if (url.pathname === '/api/graph' && req.method === 'GET') {
          try {
            const nodes = db.prepare('SELECT * FROM nodes').all();
            const edges = db.prepare('SELECT * FROM edges').all();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ nodes, edges }));
          } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: (err as Error).message }));
          }
        } 
        else if (url.pathname === '/api/analyses' && req.method === 'GET') {
          try {
            const analyses = db.prepare('SELECT * FROM analyses ORDER BY created_at DESC').all();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(analyses));
          } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: (err as Error).message }));
          }
        } 
        else if (url.pathname.startsWith('/api/analyses/') && req.method === 'GET') {
          const idStr = url.pathname.split('/').pop();
          const id = parseInt(idStr || '', 10);
          if (isNaN(id)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid ID' }));
            return;
          }
          try {
            const analysis = db.prepare('SELECT * FROM analyses WHERE id = ?').get(id);
            if (!analysis) {
              res.writeHead(404, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Analysis not found' }));
              return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(analysis));
          } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: (err as Error).message }));
          }
        } 
        else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Endpoint not found' }));
        }
      });

      server.listen(port, () => {
        logger.success(`Local API server running at http://localhost:${port}`);
        logger.dim('Use Ctrl+C to terminate');
      });

      process.on('SIGINT', () => {
        logger.info('Shutting down server...');
        server.close();
        closeDb();
        process.exit(0);
      });

    } catch (err) {
      logger.error(`Failed to start server: ${(err as Error).message}`);
      closeDb();
      process.exit(1);
    }
  });
