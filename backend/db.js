const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Use a configurable DB path so deployments can mount persistent storage.
const dbPath = process.env.DB_PATH || path.join(__dirname, 'fuel_prices.db');
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// Initialiser les tables
db.exec(`
  CREATE TABLE IF NOT EXISTS fuel_prices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    country TEXT NOT NULL,
    country_code TEXT,
    country_code_iso3 TEXT,
    gasoline REAL,
    diesel REAL,
    currency TEXT DEFAULT 'USD',
    scraped_at TEXT NOT NULL,
    UNIQUE(country, scraped_at)
  );

  CREATE TABLE IF NOT EXISTS scrape_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scraped_at TEXT NOT NULL,
    status TEXT NOT NULL,
    message TEXT
  );
`);

module.exports = db;
