// This endpoint serves data from a public Northwind JSON dataset
const NORTHWIND_JSON_URL = 'https://raw.githubusercontent.com/agershun/agensgraph-jupyter/master/datasets/northwind/northwind.json';

let cachedData = null;

async function getData() {
  if (cachedData) return cachedData;
  const res = await fetch(NORTHWIND_JSON_URL);
  cachedData = await res.json();
  return cachedData;
}

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
  const data = await getData();
  
  if (table && data[table]) {
    return res.status(200).json({ success: true, data: data[table] });
  }
  
  // Return list of tables
  const tables = Object.keys(data);
  return res.status(200).json({ success: true, tables });
}
