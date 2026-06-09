import axios from 'axios';

export const FALLBACK_RECORD = {
  prNumber: 0,
  repo: "ACIE-Enterprise",
  prUrl: "https://github.com/Sahil-Hub-Cloud/ACIE",
  prTitle: "System Offline / Standby Mode",
  prAuthor: "system",
  securityScore: 100,
  qualityScore: 100,
  healthScore: 100,
  dependencyCount: 0,
  dependencyRisk: "LOW",
  rootCause: "None Detected",
  suggestedFix: "Ensure JSONBin environment variables are configured.",
  confidence: "HIGH",
  severity: "LOW",
  risk: "LOW",
  affectedCount: 0,
  impactedSystems: ["ACIE-Core"],
  impactedFiles: [],
  dependentFiles: [],
  timestamp: new Date().toISOString()
};

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

export function sanitizeRecord(record = {}) {
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

export function summarize(records) {
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

export async function fetchRecords() {
  const id = process.env.JSONBIN_ID;
  const key = process.env.JSONBIN_KEY;

  if (!id || !key) {
    console.warn("JSONBin environment variables are not configured. Returning fallback record.");
    return [FALLBACK_RECORD];
  }

  try {
    const response = await axios.get(`https://api.jsonbin.io/v3/b/${id}/latest`, {
      headers: { 'X-Master-Key': key },
      timeout: 5000
    });
    
    const records = response.data?.record?.records;
    if (!Array.isArray(records)) {
      console.warn("Telemetry response is not a valid list. Returning fallback record.");
      return [FALLBACK_RECORD];
    }
    
    return records.map(sanitizeRecord);
  } catch (err) {
    console.error("Telemetry fetch error in shared service:", err.message);
    return [FALLBACK_RECORD];
  }
}
