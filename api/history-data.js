import axios from 'axios';

const MASTER_KEY = process.env.JSONBIN_MASTER_KEY;
let BIN_ID = process.env.JSONBIN_BIN_ID;

export default async function handler(req, res) {
  try {
    if (!BIN_ID) {
      // Create a new bin if none exists
      const createRes = await axios.post(
        'https://api.jsonbin.io/v3/b',
        { records: [] },
        { headers: { 'X-Master-Key': MASTER_KEY, 'X-Bin-Name': 'acie-pr-history' } }
      );
      BIN_ID = createRes.data.metadata.id;
      console.log('Created new bin:', BIN_ID);
    }
    const binRes = await axios.get(
      'https://api.jsonbin.io/v3/b/' + BIN_ID,
      { headers: { 'X-Master-Key': MASTER_KEY } }
    );
    return res.status(200).json(binRes.data.record);
  } catch(err) {
    console.error('History error:', err.message);
    return res.status(200).json({ records: [] });
  }
}