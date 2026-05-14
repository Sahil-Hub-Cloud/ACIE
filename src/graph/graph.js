/**
 * ACIE - Neo4j Graph Module
 * Manages the code dependency graph using Neo4j Aura.
 * Reads credentials from environment variables via dotenv.
 */

import neo4j from 'neo4j-driver';
import 'dotenv/config';

let driver = null;
let session = null;

// ─── Connect ──────────────────────────────────────────────────────────────────

/**
 * Connects to the Neo4j database using credentials from process.env.
 * Creates a new driver and session every time it's called.
 */
export async function connectToGraph() {
  const uri      = process.env.NEO4J_URI;
  const username = process.env.NEO4J_USERNAME;
  const password = process.env.NEO4J_PASSWORD;

  if (!uri || !username || !password) {
    throw new Error(
      'Missing Neo4j credentials. Set NEO4J_URI, NEO4J_USERNAME, and NEO4J_PASSWORD in your .env file.'
    );
  }

  driver = neo4j.driver(
    uri,
    neo4j.auth.basic(username, password),
    {
      connectionTimeout:            30000, // 30s to establish a connection
      maxConnectionLifetime:        60000, // recycle connections after 60s
      maxConnectionPoolSize:        5,     // max 5 concurrent connections
      connectionAcquisitionTimeout: 30000, // 30s to acquire from pool
    }
  );

  session = driver.session();

  // Verify connection
  await driver.verifyConnectivity();
  console.log(`✅ Connected to Neo4j at ${uri}`);
}


// ─── Save File Node ───────────────────────────────────────────────────────────

/**
 * Creates or updates a File node in the graph, stores its exports,
 * and creates IMPORTS relationships to the modules it depends on.
 *
 * @param {string}   filePath - e.g. "src/auth.ts"
 * @param {string[]} exports  - exported symbol names
 * @param {Array<{ from: string, names: string[] }>} imports - import entries
 */
export async function saveFileNode(filePath, exports, imports) {
  if (!session) throw new Error('Not connected. Call connectToGraph() first.');

  // Merge the File node and set its exports
  await session.run(
    `MERGE (f:File { path: $filePath })
     SET f.exports = $exports`,
    { filePath, exports }
  );

  // For each import, create the target File node and the IMPORTS relationship
  for (const imp of imports) {
    await session.run(
      `MERGE (source:File { path: $filePath })
       MERGE (target:File { path: $from })
       MERGE (source)-[r:IMPORTS]->(target)
       SET r.names = $names`,
      { filePath, from: imp.from, names: imp.names }
    );
  }

  console.log(`📝 Saved node: ${filePath} (${exports.length} export(s), ${imports.length} import(s))`);
}

// ─── Get Blast Radius ─────────────────────────────────────────────────────────

/**
 * Returns all files that directly or indirectly import the given file.
 * This is the "blast radius" — files affected if the given file changes.
 *
 * @param {string} filePath - e.g. "src/utils.ts"
 * @returns {Promise<string[]>} - list of affected file paths
 */
export async function getBlastRadius(filePath) {
  if (!session) throw new Error('Not connected. Call connectToGraph() first.');

  const result = await session.run(
    `MATCH (affected:File)-[:IMPORTS*1..]->(target:File { path: $filePath })
     RETURN DISTINCT affected.path AS affectedPath
     ORDER BY affectedPath`,
    { filePath }
  );

  const affected = result.records.map((r) => r.get('affectedPath'));
  console.log(`💥 Blast radius of "${filePath}": ${affected.length} file(s) affected`);
  return affected;
}

// ─── Close Connection ─────────────────────────────────────────────────────────

/**
 * Closes the Neo4j session and driver connection.
 * Always call this when done to avoid resource leaks.
 */
export async function closeConnection() {
  if (session) {
    await session.close();
    session = null;
  }
  if (driver) {
    await driver.close();
    driver = null;
  }
  console.log('🔌 Neo4j connection closed.');
}
