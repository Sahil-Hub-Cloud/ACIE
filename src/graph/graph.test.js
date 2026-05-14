/**
 * ACIE - Neo4j Graph Integration Test
 * Tests the graph module by saving a file node and querying the blast radius.
 *
 * Run with: node src/graph/graph.test.js
 */

import {
  connectToGraph,
  saveFileNode,
  getBlastRadius,
  closeConnection,
} from './graph.js';

async function runTest() {
  try {
    // Step 1: Connect to Neo4j
    console.log('\n🔗 Connecting to Neo4j...');
    await connectToGraph();

    // Step 2: Save a test File node for src/auth.ts
    console.log('\n📝 Saving file node for src/auth.ts...');
    await saveFileNode(
      'src/auth.ts',
      ['validateToken'],
      [{ from: './utils', names: ['hashPassword'] }]
    );

    // Step 3: Query blast radius of src/utils.ts
    // (auth.ts imports from ./utils → so utils.ts affects auth.ts)
    console.log('\n💥 Querying blast radius of src/utils.ts...');
    const affected = await getBlastRadius('src/utils.ts');

    console.log('\n📊 Result:');
    console.log(JSON.stringify({ blastRadius: affected }, null, 2));

    // Step 4: Close the connection
    console.log('\n🔌 Closing connection...');
    await closeConnection();

    console.log('\n✅ Test completed successfully!');
  } catch (err) {
    console.error('\n❌ Test failed:', err.message);
    await closeConnection();
    process.exit(1);
  }
}

runTest();
