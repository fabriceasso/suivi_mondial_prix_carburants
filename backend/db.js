const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'fuel_prices.db'));

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
