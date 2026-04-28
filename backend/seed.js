const fs = require('fs');
const path = require('path');
const db = require('./db');

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ';' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function seedFromCSV() {
  const csvPath = path.join(__dirname, 'prix_essence_monde_enriched.csv');
  if (!fs.existsSync(csvPath)) {
    console.warn('⚠️  CSV enrichi non trouvé, skip seed.');
    return;
  }

  const data = fs.readFileSync(csvPath, 'utf-8');
  const lines = data.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) {
    console.warn('⚠️  CSV vide, skip seed.');
    return;
  }

  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());
  const idxCountry = headers.indexOf('country');
  const idxCode2 = headers.indexOf('country_code');
  const idxCode3 = headers.indexOf('country_code_iso3');
  const idxGasoline = headers.indexOf('gasoline');
  const idxDiesel = headers.indexOf('diesel');
  const idxCurrency = headers.indexOf('currency');
  const idxScrapedAt = headers.indexOf('scraped_at');

  if (idxCountry === -1) {
    console.error('❌ Colonne country non trouvée dans le CSV');
    return;
  }

  const insertStmt = db.prepare(`
    INSERT OR IGNORE INTO fuel_prices
    (country, country_code, country_code_iso3, gasoline, diesel, currency, scraped_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((records) => {
    for (const r of records) insertStmt.run(r);
  });

  const records = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < headers.length) continue;

    const parseNum = (v) => {
      if (!v) return null;
      const cleaned = v.trim().replace(',', '.');
      const n = parseFloat(cleaned);
      return isNaN(n) ? null : n;
    };

    records.push([
      cols[idxCountry] || '',
      (cols[idxCode2] || '').trim(),
      (cols[idxCode3] || '').trim(),
      parseNum(cols[idxGasoline]),
      parseNum(cols[idxDiesel]),
      (cols[idxCurrency] || 'USD').trim(),
      (cols[idxScrapedAt] || '').trim(),
    ]);
  }

  insertMany(records);
  console.log(`✅ Seeded ${records.length} records from CSV`);
}

function ensureData() {
  const count = db.prepare('SELECT COUNT(*) as c FROM fuel_prices').get().c;
  if (count > 0) {
    console.log(`📦 Database already has ${count} records, skipping seed.`);
    return;
  }
  seedFromCSV();
  // Si toujours vide après CSV, fallback
  const countAfter = db.prepare('SELECT COUNT(*) as c FROM fuel_prices').get().c;
  if (countAfter === 0) {
    console.log('📦 CSV seed did not add data, using fallback seed...');
    const { seedFallbackData } = require('./scraper');
    seedFallbackData();
  }
}

module.exports = { ensureData, seedFromCSV };
