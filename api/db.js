import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';

let db = null;

async function getDb() {
  if (db) return db;

  // Fetch WASM from CDN (works in Vercel serverless)
  const wasmUrl = 'https://cdn.jsdelivr.net/npm/sql.js@1.10.3/dist/sql-wasm.wasm';
  const wasmResponse = await fetch(wasmUrl);
  const wasmBinary = await wasmResponse.arrayBuffer();

  const SQL = await initSqlJs({ wasmBinary });
  const dbPath = path.join(process.cwd(), 'db', 'northwind.db');
  const buffer = fs.readFileSync(dbPath);
  db = new SQL.Database(new Uint8Array(buffer));
  return db;
}

export default async function handler(req, res) {
  // CORS headers (required for local HTML testing)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-API-Key, Authorization, Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Auth
  const authHeader = req.headers['x-api-key'] || req.headers['authorization'];
  if (authHeader !== process.env.API_SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { sql } = req.query;
  if (!sql) return res.status(400).json({ error: 'Missing ?sql' });

  try {
    const database = await getDb();
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      const result = database.exec(sql);
      if (result.length === 0) {
        return res.status(200).json({ success: true, columns: [], rows: [] });
      }
      const { columns, values } = result[0];
      const rows = values.map(row => {
        const obj = {};
        columns.forEach((col, idx) => { obj[col] = row[idx]; });
        return obj;
      });
      return res.status(200).json({ success: true, columns, rows });
    } else {
      database.run(sql);
      // Note: writes are not persisted because we reload from file each time.
      // For read‑only Northwind, this is fine.
      return res.status(200).json({ success: true, message: 'SQL executed' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
