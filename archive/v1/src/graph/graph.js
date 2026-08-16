import neo4j from 'neo4j-driver';

let driver = null;
let session = null;

export async function connectToGraph() {
  const uri = process.env.NEO4J_URI;
  const user = process.env.NEO4J_USERNAME;
  const password = process.env.NEO4J_PASSWORD;
  console.log('Neo4j URI:', uri);
  driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
    connectionTimeout: 5000,
    maxConnectionPoolSize: 3
  });
  await driver.verifyConnectivity();
  session = driver.session();
  console.log('Neo4j session created');
}

export async function saveFileNode(filePath, exports, imports) {
  await session.run(
    'MERGE (f:File {path: $path}) SET f.exports = $exports RETURN f',
    { path: filePath, exports: exports }
  );
  for (const imp of imports) {
    await session.run(
      'MERGE (a:File {path: $from}) MERGE (b:File {path: $to}) MERGE (a)-[:IMPORTS]->(b)',
      { from: filePath, to: imp.from }
    );
  }
}

export async function getBlastRadius(filePath) {
  const result = await session.run(
    'MATCH (f:File)-[:IMPORTS]->(target:File {path: $path}) RETURN f.path as path',
    { path: filePath }
  );
  return result.records.map(r => r.get('path'));
}

export async function closeConnection() {
  if (session) await session.close();
  if (driver) await driver.close();
  session = null;
  driver = null;
}
