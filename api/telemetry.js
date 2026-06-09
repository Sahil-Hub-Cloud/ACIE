import { fetchRecords, summarize } from '../src/telemetry_service.js';

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
