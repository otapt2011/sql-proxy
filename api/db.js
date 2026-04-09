import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-API-Key, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const authHeader = req.headers['x-api-key'] || req.headers['authorization'];
  if (authHeader !== process.env.API_SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { table } = req.query;
  const jsonPath = path.join(process.cwd(), 'public', 'northwind.json');
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  
  if (table && data[table]) {
    return res.status(200).json({ success: true, data: data[table] });
  }
  
  const tables = Object.keys(data);
  return res.status(200).json({ success: true, tables });
}
