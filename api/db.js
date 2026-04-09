// Proxy to a public Northwind REST API (full dataset)
const PROXY_URL = 'https://northwind.vercel.app/api';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-API-Key, Authorization');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  // Authentication
  const authHeader = req.headers['x-api-key'] || req.headers['authorization'];
  if (authHeader !== process.env.API_SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { table } = req.query;
  
  // If no table is specified, return the list of available tables
  if (!table) {
    const tables = ['customers', 'orders', 'products', 'categories', 'suppliers', 'employees', 'shippers', 'order-details'];
    return res.status(200).json({ success: true, tables });
  }
  
  try {
    // Fetch data from the public Northwind API
    const response = await fetch(`${PROXY_URL}/${table}`);
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    const data = await response.json();
    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
