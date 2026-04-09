const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

async function convert() {
  const SQL = await initSqlJs();
  const dbPath = path.join(__dirname, 'db', 'northwind.db');
  const buffer = fs.readFileSync(dbPath);
  const db = new SQL.Database(new Uint8Array(buffer));
  
  // Get all table names
  const tablesResult = db.exec("SELECT name FROM sqlite_master WHERE type='table'");
  const tables = tablesResult[0].values.map(row => row[0]);
  
  const data = {};
  for (const table of tables) {
    const result = db.exec(`SELECT * FROM ${table}`);
    if (result.length > 0) {
      const columns = result[0].columns;
      const rows = result[0].values.map(row => {
        const obj = {};
        columns.forEach((col, idx) => { obj[col] = row[idx]; });
        return obj;
      });
      data[table] = rows;
    }
  }
  
  // Write to public/data.json
  fs.writeFileSync(path.join(__dirname, 'public', 'data.json'), JSON.stringify(data, null, 2));
  console.log('Converted northwind.db to public/data.json');
}

convert();
