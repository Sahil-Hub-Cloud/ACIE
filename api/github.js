export default async function handler(req, res) {
  console.log('--- ACIE Webhook Triggered ---');

  let parseFile, connectToGraph, saveFileNode, getBlastRadius, closeConnection, axios;
  try {
    const parser = await import('../src/parser/parser.js');
    parseFile = parser.parseFile;
    console.log('✅ Parser imported');
    const graph = await import('../src/graph/graph.js');
    connectToGraph = graph.connectToGraph;
    saveFileNode = graph.saveFileNode;
    getBlastRadius = graph.getBlastRadius;
    closeConnection = graph.closeConnection;
    console.log('✅ Graph imported');
    const axiosModule = await import('axios');
    axios = axiosModule.default;
    console.log('✅ Axios imported');
  } catch (importErr) {
    console.error('❌ Import failed:', importErr.message);
    return res.status(500).json({ error: 'Import failed', details: importErr.message });
  }
  
  if (req.method !== 'POST') {
    return res.status(200).json({ status: 'ACIE is running!' });
  }

  const event = req.headers['x-github-event'];
  const action = req.body?.action;
  
  console.log(`Event: ${event}, Action: ${action}`);

  // 1. Respond 200 immediately to GitHub
  if (event !== 'pull_request' || !['opened', 'synchronize', 'reopened'].includes(action)) {
    console.log('Ignoring event/action');
    return res.status(200).json({ status: 'ignored' });
  }

  res.status(200).json({ status: 'ok' });

  // 2. Start async processing pipeline
  const repo = req.body.repository.full_name;
  const prNumber = req.body.pull_request.number;
  const headSha = req.body.pull_request.head.sha;
  const token = process.env.GITHUB_TOKEN;
  const headers = { 
    Authorization: `token ${token}`, 
    Accept: 'application/vnd.github.v3+json' 
  };

  try {
    console.log(`🚀 Starting pipeline for PR #${prNumber} in ${repo}`);
    console.log('🔌 Connecting to Neo4j...');
    await Promise.race([
      connectToGraph(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Neo4j connect timeout after 10s')), 10000))
    ]);
    console.log('✅ Neo4j connected');

    // a. Get the list of changed files
    console.log('Fetching changed files from GitHub...');
    const filesRes = await axios.get(`https://api.github.com/repos/${repo}/pulls/${prNumber}/files`, { headers });
    const prFiles = filesRes.data;
    
    // b. Filter for .js, .ts, .jsx, .tsx files
    const jsFiles = prFiles.filter(f => f.filename.match(/\.(js|ts|jsx|tsx)$/));
    console.log(`Found ${jsFiles.length} JS/TS files to analyze.`);
    console.log('📁 Changed files:', jsFiles.map(f => f.filename));

    if (jsFiles.length === 0) {
      console.log('No relevant source files changed. Exiting.');
      await closeConnection();
      return;
    }

    const changedFilesInfo = [];
    const allAffectedFiles = new Set();
    const missingTests = [];

    // c. Process each file
    for (const file of jsFiles) {
      const filePath = file.filename;
      console.log(`Processing file: ${filePath}`);
      
      try {
        // Fetch content from GitHub
        const contentRes = await axios.get(`https://api.github.com/repos/${repo}/contents/${filePath}?ref=${headSha}`, { headers });
        const content = Buffer.from(contentRes.data.content, 'base64').toString('utf-8');
        
        // Parse imports/exports
        const parsed = parseFile(filePath, content);
        console.log(`Parsed ${filePath}: ${parsed.exports.length} exports, ${parsed.imports.length} imports`);
        
        // Save to Neo4j
        await saveFileNode(filePath, parsed.exports, parsed.imports);
        console.log('💾 Saved:', file.filename);
        
        changedFilesInfo.push({
          path: filePath,
          exports: parsed.exports.length,
          imports: parsed.imports.length
        });

        // Check for test file coverage
        // A test file is any file ending in .test.js, .test.ts, .spec.js, .spec.ts
        const isTestFile = filePath.match(/\.(test|spec)\.(js|ts|jsx|tsx)$/);
        if (!isTestFile) {
          const baseName = filePath.split('.').slice(0, -1).join('.');
          const testPatterns = [
            `${baseName}.test.js`, `${baseName}.test.ts`, `${baseName}.test.jsx`, `${baseName}.test.tsx`,
            `${baseName}.spec.js`, `${baseName}.spec.ts`, `${baseName}.spec.jsx`, `${baseName}.spec.tsx`
          ];
          
          const hasTestInPR = prFiles.some(f => testPatterns.includes(f.filename));
          if (!hasTestInPR) {
            missingTests.push(filePath);
          }
        }

        // d. Query blast radius
        const blast = await getBlastRadius(filePath);
        console.log('💥 Blast radius for', file.filename, ':', blast);
        blast.forEach(f => {
          // Don't count the file itself in its own blast radius
          if (f !== filePath) allAffectedFiles.add(f);
        });
        
      } catch (fileErr) {
        console.error(`❌ Error analyzing ${filePath}:`, fileErr.message);
      }
    }

    // e. Calculate Risk Score
    const affectedCount = allAffectedFiles.size;
    let riskLevel = 'LOW';
    if (affectedCount >= 3) riskLevel = 'HIGH';
    else if (affectedCount >= 1) riskLevel = 'MEDIUM';

    console.log(`Risk Assessment: ${riskLevel} (${affectedCount} affected files)`);

    // f. Post Report Comment
    console.log('Generating Markdown report...');
    let reportBody = '';
    
    if (affectedCount === 0) {
      reportBody = `## ✅ ACIE — Change Impact Report\n\n### 📁 Files Changed\n`;
      changedFilesInfo.forEach(f => {
        reportBody += `- ${f.path} (${f.exports} export${f.exports !== 1 ? 's' : ''}, ${f.imports} import${f.imports !== 1 ? 's' : ''})\n`;
      });
      reportBody += `\n### 💥 Blast Radius\nNo other files affected by this change.\n\n### 🎯 Risk Score: **LOW**\nSafe to merge.\n\n*Powered by [ACIE](https://github.com/Sahil-Hub-Cloud/ACIE) — AI Change Impact Engine*`;
    } else {
      reportBody = `## 🔍 ACIE — Change Impact Report\n\n### 📁 Files Changed\n`;
      changedFilesInfo.forEach(f => {
        reportBody += `- ${f.path} (${f.exports} export${f.exports !== 1 ? 's' : ''}, ${f.imports} import${f.imports !== 1 ? 's' : ''})\n`;
      });
      
      reportBody += `\n### 💥 Blast Radius\n`;
      allAffectedFiles.forEach(f => {
        reportBody += `- ${f}\n`;
      });
      
      reportBody += `\n### 🎯 Risk Score: **${riskLevel}**\n- ${affectedCount} file${affectedCount !== 1 ? 's' : ''} affected by this change\n`;
      
      missingTests.forEach(f => {
        reportBody += `- ⚠️ ${f} has no test coverage\n`;
      });
      
      reportBody += `\n### 💡 Recommendation\nReview the affected files before merging.\n\n*Powered by [ACIE](https://github.com/Sahil-Hub-Cloud/ACIE) — AI Change Impact Engine*`;
    }

    console.log('💬 Posting comment...');
    await axios.post(`https://api.github.com/repos/${repo}/issues/${prNumber}/comments`, { body: reportBody }, { headers });
    console.log('✅ Comment posted!');
    console.log('✅ Pipeline completed successfully.');

    await closeConnection();
  } catch (err) {
    console.error('🔴 ACIE Pipeline Fatal Error:', err.message);
    try { await closeConnection(); } catch {}
  }
}
