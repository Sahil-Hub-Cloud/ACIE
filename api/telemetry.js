import axios from 'axios';

function getJsonBinConfig() {
  const id = process.env.JSONBIN_ID;
  const key = process.env.JSONBIN_KEY;

  if (!id || !key) {
    throw new Error('JSONBin environment variables are not configured');
  }

  return { id, key };
}

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function cleanString(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

function cleanArray(value) {
  return toArray(value).map(cleanString);
}

function sanitizeRecord(record = {}) {
  return {
    prNumber: record.prNumber ?? null,
    repo: cleanString(record.repo),
    prUrl: cleanString(record.prUrl),
    prTitle: cleanString(record.prTitle),
    prAuthor: cleanString(record.prAuthor),
    securityScore: Number.isFinite(record.securityScore) ? record.securityScore : 100,
    qualityScore: Number.isFinite(record.qualityScore) ? record.qualityScore : null,
    healthScore: Number.isFinite(record.healthScore) ? record.healthScore : null,
    dependencyCount: Number.isFinite(record.dependencyCount) ? record.dependencyCount : 0,
    dependencyRisk: cleanString(record.dependencyRisk ?? record.risk ?? 'LOW'),
    rootCause: cleanString(record.rootCause ?? 'None Detected'),
    suggestedFix: cleanString(record.suggestedFix ?? 'Standard review.'),
    confidence: cleanString(record.confidence ?? 'NONE'),
    severity: cleanString(record.severity ?? record.risk ?? 'LOW'),
    risk: cleanString(record.risk ?? record.severity ?? 'LOW'),
    affectedCount: Number.isFinite(record.affectedCount)
      ? record.affectedCount
      : toArray(record.impactedFiles).length,
    impactedSystems: cleanArray(record.impactedSystems),
    impactedFiles: cleanArray(record.impactedFiles),
    dependentFiles: cleanArray(record.dependentFiles),
    timestamp: cleanString(record.timestamp)
  };
}

function summarize(records) {
  const latest = records[0] || {};
  return {
    count: records.length,
    latest,
    moneySaved: records.length * 5000,
    hoursSaved: records.length * 40,
    highRisk: records.filter(r => r.risk === 'HIGH' || r.severity === 'CRITICAL').length,
    mediumRisk: records.filter(r => r.risk === 'MEDIUM').length,
    lowRisk: records.filter(r => r.risk === 'LOW' || r.severity === 'LOW').length
  };
}

async function fetchRecords() {
  const { id, key } = getJsonBinConfig();
  const response = await axios.get(`https://api.jsonbin.io/v3/b/${id}/latest`, {
    headers: { 'X-Master-Key': key }
  });

  return toArray(response.data?.record?.records).map(sanitizeRecord);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const view = req.query?.view || 'latest';

  try {
    const records = await fetchRecords();
    const latest = records[0] || {};

    if (view === 'latest') {
      return res.status(200).json({ latest, records });
    }

    if (view === 'summary') {
      return res.status(200).json(summarize(records));
    }

    if (view === 'history') {
      return res.status(200).json({ records });
    }

    return res.status(400).json({ error: 'Unsupported telemetry view' });
  } catch (err) {
    console.error('Telemetry fetch error:', err.message);
    return res.status(500).json({ error: 'Telemetry unavailable' });
  }
}
