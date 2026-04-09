import data from '../public/data.json' assert { type: 'json' };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-API-Key, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const authHeader = req.headers['x-api-key'] || req.headers['authorization'];
  if (authHeader !== process.env.API_SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { table, sql } = req.query;
  
  // Simple table lookup
  if (table && data[table]) {
    return res.status(200).json({ success: true, data: data[table] });
  }
  
  // SQL-like filtering? For simplicity, return list of tables
  if (sql && sql.toLowerCase().includes('sqlite_master')) {
    const tables = Object.keys(data);
    return res.status(200).json({ 
      success: true, 
      columns: ['name'], 
      rows: tables.map(name => ({ name })) 
    });
  }
  
  return res.status(400).json({ error: 'Use ?table=name to get data' });
}
