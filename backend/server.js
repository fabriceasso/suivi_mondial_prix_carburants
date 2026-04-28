const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const db = require('./db');
const { runScraper, seedFallbackData } = require('./scraper');

const app = express();
const PORT = process.env.PORT || 3001;

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());

// ─── Helpers ────────────────────────────────────────────────────────────────
function getLatestDate() {
  const row = db.prepare(`SELECT MAX(scraped_at) as d FROM fuel_prices`).get();
  return row?.d || null;
}

// ─── Routes ─────────────────────────────────────────────────────────────────

/** GET /api/prices — prix les plus récents de tous les pays */
app.get('/api/prices', (req, res) => {
  const date = getLatestDate();
  if (!date) return res.json({ data: [], date: null });

  const { fuel = 'gasoline' } = req.query;
  const col = fuel === 'diesel' ? 'diesel' : 'gasoline';

  const data = db.prepare(`
    SELECT country, country_code, country_code_iso3, gasoline, diesel, scraped_at
    FROM fuel_prices
    WHERE scraped_at = ?
      AND ${col} IS NOT NULL
    ORDER BY ${col} ASC
  `).all(date);

  const avg = data.reduce((s, r) => s + (r[col] || 0), 0) / data.length;

  res.json({ data, date, avg: parseFloat(avg.toFixed(3)) });
});

/** GET /api/prices/:country — historique pour un pays */
app.get('/api/prices/:country', (req, res) => {
  const country = decodeURIComponent(req.params.country);

  const history = db.prepare(`
    SELECT scraped_at, gasoline, diesel
    FROM fuel_prices
    WHERE LOWER(country) = LOWER(?)
    ORDER BY scraped_at ASC
  `).all(country);

  if (!history.length) {
    return res.status(404).json({ error: 'Pays non trouvé' });
  }

  const latest = history[history.length - 1];
  const prev = history.length > 1 ? history[history.length - 2] : null;

  // Moyennes mondiales pour la date la plus récente
  const gasolineAvg = db.prepare(`SELECT AVG(gasoline) as avg FROM fuel_prices WHERE scraped_at = ? AND gasoline IS NOT NULL`).get(latest.scraped_at);
  const dieselAvg = db.prepare(`SELECT AVG(diesel) as avg FROM fuel_prices WHERE scraped_at = ? AND diesel IS NOT NULL`).get(latest.scraped_at);

  res.json({
    country,
    country_code: db.prepare(`SELECT country_code FROM fuel_prices WHERE LOWER(country) = LOWER(?) LIMIT 1`).get(country)?.country_code,
    latest,
    previous: prev,
    history,
    global_avg: {
      gasoline: parseFloat((gasolineAvg?.avg || 0).toFixed(3)),
      diesel: parseFloat((dieselAvg?.avg || 0).toFixed(3)),
    },
  });
});

/** GET /api/top — top 5 des moins chers et des plus chers */
app.get('/api/top', (req, res) => {
  const date = getLatestDate();
  if (!date) return res.json({ cheapest: [], expensive: [] });

  const { fuel = 'gasoline' } = req.query;
  const col = fuel === 'diesel' ? 'diesel' : 'gasoline';

  const cheapest = db.prepare(`
    SELECT country, country_code, ${col} as price
    FROM fuel_prices WHERE scraped_at = ? AND ${col} IS NOT NULL
    ORDER BY ${col} ASC LIMIT 5
  `).all(date);

  const expensive = db.prepare(`
    SELECT country, country_code, ${col} as price
    FROM fuel_prices WHERE scraped_at = ? AND ${col} IS NOT NULL
    ORDER BY ${col} DESC LIMIT 5
  `).all(date);

  res.json({ cheapest, expensive, date, fuel });
});

/** POST /api/scrape — déclenchement manuel */
app.post('/api/scrape', async (req, res) => {
  try {
    const ok = await runScraper();
    res.json({ success: ok, message: ok ? 'Extraction terminée' : "L'extraction a échoué, vérifiez les logs" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/** GET /api/health */
app.get('/api/health', (req, res) => {
  const date = getLatestDate();
  const count = db.prepare(`SELECT COUNT(*) as c FROM fuel_prices WHERE scraped_at = ?`).get(date || '')?.c || 0;
  res.json({ status: 'ok', latestDate: date, countryCount: count });
});

// ─── Startup ─────────────────────────────────────────────────────────────────
async function start() {
  // Remplissage des données de secours désactivé (on a déjà des données réelles)
  // seedFallbackData();

  // Essai d'extraction en direct en arrière-plan (non bloquant)
  runScraper().catch(() => {});

  // Programmer l'extraction quotidienne à 02:00 du matin
  cron.schedule('0 2 * * *', () => {
    console.log('⏰ Exécution de l\'extraction quotidienne programmée...');
    runScraper();
  });

  app.listen(PORT, () => {
    console.log(`🚀 API Backend en cours d'exécution sur http://localhost:${PORT}`);
  });
}

start();
