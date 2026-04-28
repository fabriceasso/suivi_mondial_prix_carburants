const axios = require('axios');
const cheerio = require('cheerio');
const db = require('./db');

// Carte des codes ISO des pays pour la coloration de la carte
// Carte des codes ISO des pays (Noms en FRANCAIS pour correspondre au site fr.globalpetrolprices.com)
const COUNTRY_CODES = {
  'Afghanistan': 'AF', 'Albanie': 'AL', 'Algérie': 'DZ', 'Andorre': 'AD', 'Angola': 'AO', 'Argentine': 'AR',
  'Arménie': 'AM', 'Australie': 'AU', 'Autriche': 'AT', 'Azerbaïdjan': 'AZ', 'Bahreïn': 'BH',
  'Bangladesh': 'BD', 'Bélarus': 'BY', 'Belgique': 'BE', 'Belize': 'BZ', 'Bolivie': 'BO', 'Bosnie-Herzégovine': 'BA',
  'Brésil': 'BR', 'Bulgarie': 'BG', 'Cambodge': 'KH', 'Cameroun': 'CM', 'Canada': 'CA',
  'Chili': 'CL', 'Chine': 'CN', 'Colombie': 'CO', 'Croatie': 'HR', 'Cuba': 'CU',
  'Chypre': 'CY', 'République Tchèque': 'CZ', 'Danemark': 'DK', 'République Dominicaine': 'DO',
  'Équateur': 'EC', 'Égypte': 'EG', 'Estonie': 'EE', 'Éthiopie': 'ET', 'Finlande': 'FI',
  'France': 'FR', 'Géorgie': 'GE', 'Germany': 'DE', 'Allemagne': 'DE', 'Ghana': 'GH', 'Guatemala': 'GT', 'Honduras': 'HN', 'Hong Kong': 'HK',
  'Hongrie': 'HU', 'Hungary': 'HU', 'Islande': 'IS', 'Iceland': 'IS', 'Inde': 'IN', 'India': 'IN', 'Indonésie': 'ID', 'Indonesia': 'ID', 'Iran': 'IR', 'Irak': 'IQ', 'Iraq': 'IQ',
  'Irlande': 'IE', 'Ireland': 'IE', 'Israël': 'IL', 'Israel': 'IL', 'Italie': 'IT', 'Italy': 'IT', 'Jamaïque': 'JM', 'Jamaica': 'JM', 'Japon': 'JP', 'Japan': 'JP',
  'Jordanie': 'JO', 'Jordan': 'JO', 'Kazakhstan': 'KZ', 'Kenya': 'KE', 'Koweït': 'KW', 'Kuwait': 'KW', 'Kirghizistan': 'KG', 'Kyrgyzstan': 'KG', 'République Kirghize': 'KG',
  'Lettonie': 'LV', 'Latvia': 'LV', 'Liban': 'LB', 'Lebanon': 'LB', 'Lesotho': 'LS', 'Libye': 'LY', 'Libya': 'LY', 'Lituanie': 'LT', 'Lithuania': 'LT', 'Luxembourg': 'LU',
  'Macédoine du Nord': 'MK', 'Macedonia': 'MK', 'Nord Macédoine': 'MK', 'Nord Мacédoine': 'MK', 'Malaisie': 'MY', 'Malaysia': 'MY',
  'Mexique': 'MX', 'Mexico': 'MX', 'Moldavie': 'MD', 'Moldova': 'MD', 'La Moldavie': 'MD', 'Mongolie': 'MN', 'Mongolia': 'MN', 'Monténégro': 'ME', 'Montenegro': 'ME', 'Maroc': 'MA', 'Morocco': 'MA',
  'Mozambique': 'MZ', 'Myanmar': 'MM', 'Burma-Myanmar': 'MM', 'Pays-Bas': 'NL', 'Netherlands': 'NL', 'Nouvelle-Zélande': 'NZ', 'New-Zealand': 'NZ',
  'Nicaragua': 'NI', 'Nigéria': 'NG', 'Nigeria': 'NG', 'Niger': 'NE', 'Norvège': 'NO', 'Norway': 'NO', 'Oman': 'OM', 'Pakistan': 'PK',
  'Panama': 'PA', 'Paraguay': 'PY', 'Pérou': 'PE', 'Peru': 'PE', 'Philippines': 'PH', 'Pologne': 'PL', 'Poland': 'PL',
  'Portugal': 'PT', 'Qatar': 'QA', 'Roumanie': 'RO', 'Romania': 'RO', 'Russie': 'RU', 'Russia': 'RU', 'Arabie Saoudite': 'SA', 'Saudi-Arabia': 'SA',
  'Sénégal': 'SN', 'Senegal': 'SN', 'Serbie': 'RS', 'Serbia': 'RS', 'Sierra Leone': 'SL', 'Singapour': 'SG', 'Singapore': 'SG', 'Slovaquie': 'SK', 'Slovakia': 'SK', 'Slovénie': 'SI', 'Slovenia': 'SI',
  'Afrique du Sud': 'ZA', 'South-Africa': 'ZA', 'Corée du Sud': 'KR', 'South-Korea': 'KR', 'Espagne': 'ES', 'Spain': 'ES', 'Sri Lanka': 'LK', 'Sri-Lanka': 'LK',
  'Soudan': 'SD', 'Sudan': 'SD', 'Suède': 'SE', 'Sweden': 'SE', 'Suisse': 'CH', 'Switzerland': 'CH', 'Syrie': 'SY', 'Syria': 'SY', 'Taïwan': 'TW', 'Taiwan': 'TW',
  'Tadjikistan': 'TJ', 'Tanzanie': 'TZ', 'Tanzania': 'TZ', 'Thaïlande': 'TH', 'Thailand': 'TH', 'Trinité et Tobago': 'TT', 'Trinidad-and-Tobago': 'TT', 'Trinité-et-Tobago': 'TT',
  'Tunisie': 'TN', 'Tunisia': 'TN', 'Turquie': 'TR', 'Turkey': 'TR', 'Turkménistan': 'TM', 'Turkmenistan': 'TM', 'Ouganda': 'UG', 'Uganda': 'UG', 'Ukraine': 'UA',
  'Émirats Arabes Unis': 'AE', 'United-Arab-Emirates': 'AE', 'Royaume-Uni': 'GB', 'United-Kingdom': 'GB', 'États-Unis': 'US', 'USA': 'US', 'Uruguay': 'UY',
  'Ouzbékistan': 'UZ', 'Uzbekistan': 'UZ', 'Venezuela': 'VE', 'Vietnam': 'VN', 'Viet Nam': 'VN', 'Yémen': 'YE', 'Yemen': 'YE',
  'Zambie': 'ZM', 'Zambia': 'ZM', 'Zimbabwe': 'ZW', 'Côte d’Ivoire': 'CI', "Cote d'Ivoire": 'CI', 'Ivory-Coast': 'CI',
  'Népal': 'NP', 'Nepal': 'NP', 'Salvador': 'SV', 'El Salvador': 'SV', 'El-Salvador': 'SV', 'Costa Rica': 'CR', 'Costa-Rica': 'CR',
  'Haïti': 'HT', 'Haiti': 'HT', 'Maurice': 'MU', 'Mauritius': 'MU', 'Botswana': 'BW', 'Namibie': 'NA', 'Namibia': 'NA', 'Malawi': 'MW', 'Rwanda': 'RW',
  'Togo': 'TG', 'Grenade': 'GD', 'Grenada': 'GD', 'Fidji': 'FJ', 'Fiji': 'FJ', 'Maldives': 'MV', 'Gabon': 'GA', 'Guyane': 'GF', 'Guyana': 'GF', 'Bhoutan': 'BT', 'Bhutan': 'BT',
  'D.R. Congo': 'CD', 'Democratic-Republic-of-the-Congo': 'CD', 'Curacao': 'CW', 'Curaçao': 'CW', 'Îles Wallis et Futuna': 'WF', 'Wallis et Futuna': 'WF',
  'Andorra': 'AD', 'Aruba': 'AW', 'Bahamas': 'BS', 'Barbade': 'BB', 'Barbados': 'BB', 'Bénin': 'BJ', 'Benin': 'BJ', 'Birmanie': 'MM', 'Burundi': 'BI', 'Burkina Faso': 'BF', 'Burkina-Faso': 'BF',
  'Cap-Vert': 'CV', 'Cape-Verde': 'CV', 'Îles Caïmans': 'KY', 'Cayman-Islands': 'KY', 'Rép. Centrafricaine': 'CF', 'Central African Republic': 'CF', 'Dominique': 'DM', 'Dominica': 'DM', 'Rép. Dominicaine': 'DO', 'Dominican-Republic': 'DO',
  'Grèce': 'GR', 'Greece': 'GR', 'Guadeloupe': 'GP', 'Guam': 'GU', 'Guinée': 'GN', 'Guinea': 'GN', 'Guernsey': 'GG', 'Guyana': 'GY',
  'Laos': 'LA', 'Libéria': 'LR', 'Liberia': 'LR', 'Liechtenstein': 'LI', 'Madagascar': 'MG', 'Mali': 'ML', 'Malte': 'MT', 'Malta': 'MT', 'Mayotte': 'YT', 'Monaco': 'MC',
  'Porto Rico': 'PR', 'Puerto-Rico': 'PR', 'Puerto Rico': 'PR', 'Rép. Dominicaine': 'DO',
  'Sainte-Lucie': 'LC', 'Saint-Lucia': 'LC', 'Saint Lucia': 'LC', 'Saint-Marin': 'SM', 'San Marino': 'SM', 'Seychelles': 'SC', 'Suriname': 'SR', 'Surinam': 'SR',
  'Swaziland': 'SZ', 'Eswatini': 'SZ',
  'Îles Wallis et Futuna': 'WF', 'Wallis-and-Futuna-Islands': 'WF',
  'Algeria': 'DZ', 'Algérie': 'DZ', 'Egypt': 'EG', 'Égypte': 'EG', 'Brazil': 'BR', 'Brésil': 'BR'
};

// Map ISO-2 vers ISO-3
const ISO2_TO_ISO3 = {
  'AD': 'AND', 'AF': 'AFG', 'AL': 'ALB', 'DZ': 'DZA', 'AO': 'AGO', 'AQ': 'ATA', 'AR': 'ARG', 'AM': 'ARM', 'AU': 'AUS', 'AT': 'AUT', 'AZ': 'AZE', 'BS': 'BHS', 'BH': 'BHR', 'BD': 'BGD', 'BY': 'BLR', 'BE': 'BEL', 'BZ': 'BLZ', 'BJ': 'BEN', 'BT': 'BTN', 'BO': 'BOL', 'BA': 'BIH', 'BW': 'BWA', 'BR': 'BRA', 'BN': 'BRN', 'BG': 'BGR', 'BF': 'BFA', 'BI': 'BDI', 'KH': 'KHM', 'CM': 'CMR', 'CA': 'CAN', 'CV': 'CPV', 'CF': 'CAF', 'TD': 'TCD', 'CL': 'CHL', 'CN': 'CHN', 'CO': 'COL', 'KM': 'COM', 'CG': 'COG', 'CD': 'COD', 'CR': 'CRI', 'CI': 'CIV', 'HR': 'HRV', 'CU': 'CUB', 'CY': 'CYP', 'CZ': 'CZE', 'DK': 'DNK', 'DJ': 'DJI', 'DM': 'DMA', 'DO': 'DOM', 'EC': 'ECU', 'EG': 'EGY', 'SV': 'SLV', 'GQ': 'GNQ', 'ER': 'ERI', 'EE': 'EST', 'ET': 'ETH', 'FJ': 'FJI', 'FI': 'FIN', 'FR': 'FRA', 'GA': 'GAB', 'GM': 'GMB', 'GE': 'GEO', 'DE': 'DEU', 'GH': 'GHA', 'GR': 'GRC', 'GD': 'GRD', 'GT': 'GTM', 'GN': 'GIN', 'GW': 'GNB', 'GY': 'GUY', 'HT': 'HTI', 'HN': 'HND', 'HK': 'HKG', 'HU': 'HUN', 'IS': 'ISL', 'IN': 'IND', 'ID': 'IDN', 'IR': 'IRN', 'IQ': 'IRQ', 'IE': 'IRL', 'IL': 'ISR', 'IT': 'ITA', 'JM': 'JAM', 'JP': 'JPN', 'JO': 'JOR', 'KZ': 'KAZ', 'KE': 'KEN', 'KI': 'KIR', 'KP': 'PRK', 'KR': 'KOR', 'KW': 'KWT', 'KG': 'KGZ', 'LA': 'LAO', 'LV': 'LVA', 'LB': 'LBN', 'LS': 'LSO', 'LR': 'LBR', 'LY': 'LBY', 'LI': 'LIE', 'LT': 'LTU', 'LU': 'LUX', 'MO': 'MAC', 'MK': 'MKD', 'MG': 'MDG', 'MW': 'MWI', 'MY': 'MYS', 'MV': 'MDV', 'ML': 'MLI', 'MT': 'MLT', 'MH': 'MHL', 'MR': 'MRT', 'MU': 'MUS', 'MX': 'MEX', 'FM': 'FSM', 'MD': 'MDA', 'MC': 'MCO', 'MN': 'MNG', 'ME': 'MNE', 'MA': 'MAR', 'MZ': 'MOZ', 'MM': 'MMR', 'NA': 'NAM', 'NR': 'NRU', 'NP': 'NPL', 'NL': 'NLD', 'NZ': 'NZL', 'NI': 'NIC', 'NE': 'NER', 'NG': 'NGA', 'NO': 'NOR', 'OM': 'OMN', 'PK': 'PAK', 'PW': 'PLW', 'PA': 'PAN', 'PG': 'PNG', 'PY': 'PRY', 'PE': 'PER', 'PH': 'PHL', 'PL': 'POL', 'PT': 'PRT', 'QA': 'QAT', 'RO': 'ROU', 'RU': 'RUS', 'RW': 'RWA', 'KN': 'KNA', 'LC': 'LCA', 'VC': 'VCT', 'WS': 'WSM', 'SM': 'SMR', 'ST': 'STP', 'SA': 'SAU', 'SN': 'SEN', 'RS': 'SRB', 'SC': 'SYC', 'SL': 'SLE', 'SG': 'SGP', 'SK': 'SVK', 'SI': 'SVN', 'SB': 'SLB', 'SO': 'SOM', 'ZA': 'ZAF', 'ES': 'ESP', 'LK': 'LKA', 'SD': 'SDN', 'SR': 'SUR', 'SZ': 'SWZ', 'SE': 'SWE', 'CH': 'CHE', 'SY': 'SYR', 'TW': 'TWN', 'TJ': 'TJK', 'TZ': 'TZA', 'TH': 'THA', 'TL': 'TLS', 'TG': 'TGO', 'TO': 'TON', 'TT': 'TTO', 'TN': 'TUN', 'TR': 'TUR', 'TM': 'TKM', 'TV': 'TUV', 'UG': 'UGA', 'UA': 'UKR', 'AE': 'ARE', 'GB': 'GBR', 'US': 'USA', 'UY': 'URY', 'UZ': 'UZB', 'VU': 'VUT', 'VE': 'VEN', 'VN': 'VNM', 'WF': 'WLF', 'YE': 'YEM', 'ZM': 'ZMB', 'ZW': 'ZWE'
};


// Fonction pour parser une date française (ex: 13-avr-2026) vers YYYY-MM-DD
function parseFrenchDate(dateStr) {
  if (!dateStr) return null;
  const parts = dateStr.match(/(\d{2})-([a-z]{3})-(\d{4})/i);
  if (!parts) return null;

  const day = parts[1];
  const monthNames = {
    'jan': '01', 'fév': '02', 'mar': '03', 'avr': '04', 'mai': '05', 'juin': '06',
    'juil': '07', 'aoû': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'déc': '12'
  };
  const month = monthNames[parts[2].toLowerCase()];
  const year = parts[3];

  if (!month) return null;
  return `${year}-${month}-${day}`;
}

async function scrapeGlobalPetrolPrices(fuelType = 'gasoline') {
  const url = `https://fr.globalpetrolprices.com/${fuelType}_prices/`;
  console.log(`Scraping des prix de l'${fuelType === 'gasoline' ? 'essence' : 'diesel'} depuis ${url}...`);

  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'fr-FR,fr;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: 30000,
    });

    const $ = cheerio.load(data);
    const results = [];
    
    // Extraction de la date depuis le titre h1
    const h1Text = $('h1').first().text().trim();
    const scrapedAt = parseFrenchDate(h1Text) || new Date().toISOString().split('T')[0];
    console.log(`Date des données détectée : ${scrapedAt}`);

    // Format 1 : Graphique interactif (Format spécifique à fr.globalpetrolprices.com)
    const scrapedData = [];
    $('.graph_outside_link').each((_, el) => {
      const name = $(el).text().trim().replace(/\*/g, '').trim();
      const href = $(el).attr('href') || '';
      const urlName = href.split('/')[1] || ''; // Extrait "Algeria" de "/Algeria/gasoline_prices/"
      scrapedData.push({ name, urlName });
    });

    // Les prix sont regroupés dans un bloc de texte ordonné dans le premier div de #graphic
    const priceContainer = $('#graphic > div').first();
    if (priceContainer.length > 0 && scrapedData.length > 0) {
      const allPricesText = priceContainer.text().trim();
      const priceList = allPricesText.split('\n')
        .map(p => p.trim().replace(',', '.'))
        .filter(p => p.length > 0 && !isNaN(parseFloat(p)));

      scrapedData.forEach((item, i) => {
        const price = parseFloat(priceList[i]);
        if (item.name && !isNaN(price)) {
          results.push({ 
            country: item.name, 
            urlName: item.urlName,
            price, 
            scraped_at: scrapedAt 
          });
        }
      });
    }

    // Format 2 : Table WordPress/TablePress (fallback historique)
    if (results.length === 0) {
      $('table#tablepress-1 tbody tr, table.graph_table tbody tr, table tbody tr').each((_, row) => {
        const cells = $(row).find('td');
        if (cells.length >= 2) {
          const country = $(cells[0]).text().trim().replace(/\*/g, '').trim();
          const priceText = $(cells[1]).text().trim().replace(',', '.');
          const price = parseFloat(priceText);
          if (country && !isNaN(price) && price > 0) {
            results.push({ country, price, scraped_at: scrapedAt });
          }
        }
      });
    }

    console.log(`Trouvé ${results.length} prix pour l'${fuelType === 'gasoline' ? 'essence' : 'diesel'}`);
    return results;
  } catch (error) {
    console.error(`Erreur d'extraction (${fuelType}) :`, error.message);
    return [];
  }
}

async function runScraper() {
  try {
    const gasolinePrices = await scrapeGlobalPetrolPrices('gasoline');
    const dieselPrices = await scrapeGlobalPetrolPrices('diesel');

    if (gasolinePrices.length === 0 && dieselPrices.length === 0) {
      console.warn('Scraping échoué ou aucune donnée trouvée.');
      return false;
    }

    // Fusionner les données
    const countryMap = new Map();
    let sampleDate = new Date().toISOString().split('T')[0];

    // Helper pour trouver les codes pays
    const getCodes = (name, urlName) => {
      const code2 = COUNTRY_CODES[name] || COUNTRY_CODES[urlName] || COUNTRY_CODES[urlName?.replace(/-/g, ' ')] || null;
      const code3 = code2 ? ISO2_TO_ISO3[code2] : null;
      if (!code2) console.log(`[Missing Code] Country: ${name}, URL: ${urlName}`);
      return { code2, code3 };
    };

    gasolinePrices.forEach(p => {
      if (p.scraped_at) sampleDate = p.scraped_at;
      const { code2, code3 } = getCodes(p.country, p.urlName);
      countryMap.set(p.country, { 
        country: p.country, 
        country_code: code2, 
        country_code_iso3: code3,
        gasoline: p.price, 
        diesel: null,
        scraped_at: p.scraped_at 
      });
    });

    dieselPrices.forEach(p => {
      if (p.scraped_at) sampleDate = p.scraped_at;
      const existing = countryMap.get(p.country);
      const { code2, code3 } = getCodes(p.country, p.urlName);

      if (existing) {
        existing.diesel = p.price;
        if (!existing.country_code) existing.country_code = code2;
        if (!existing.country_code_iso3) existing.country_code_iso3 = code3;
      } else {
        countryMap.set(p.country, { 
          country: p.country, 
          country_code: code2, 
          country_code_iso3: code3,
          gasoline: null, 
          diesel: p.price,
          scraped_at: p.scraped_at
        });
      }
    });

    const insertStmt = db.prepare(`
      INSERT OR REPLACE INTO fuel_prices (country, country_code, country_code_iso3, gasoline, diesel, scraped_at)
      VALUES (@country, @country_code, @country_code_iso3, @gasoline, @diesel, @scraped_at)
    `);

    const insertMany = db.transaction((records) => {
      for (const record of records) {
        insertStmt.run(record);
      }
    });

    const records = Array.from(countryMap.values());
    console.log(`Tentative d'insertion de ${records.length} records`);
    insertMany(records);

    // Logging
    db.prepare(`INSERT INTO scrape_log (scraped_at, status, message) VALUES (?, ?, ?)`)
      .run(sampleDate, 'OK', `Extraction réussie pour ${records.length} pays.`);

    console.log(`✅ Mise à jour terminée pour la date : ${sampleDate} (${records.length} pays).`);
    return true;
  } catch (err) {
    console.error('Erreur Scraper:', err);
    return false;
  }
}

// Remplissage avec des données statiques réalistes pour que l'application fonctionne même si l'extraction est bloquée
function seedFallbackData() {
  const today = new Date().toISOString().split('T')[0];
  const existing = db.prepare(`SELECT COUNT(*) as c FROM fuel_prices WHERE scraped_at = ?`).get(today);
  if (existing.c > 0) return;

  console.log('Remplissage des données de secours...');
  const seed = [
    { country: 'Venezuela', country_code: 'VE', gasoline: 0.02, diesel: 0.01 },
    { country: 'Libye', country_code: 'LY', gasoline: 0.03, diesel: 0.02 },
    { country: 'Iran', country_code: 'IR', gasoline: 0.04, diesel: 0.04 },
    { country: 'Algérie', country_code: 'DZ', gasoline: 0.37, diesel: 0.26 },
    { country: 'Koweït', country_code: 'KW', gasoline: 0.39, diesel: 0.26 },
    { country: 'Égypte', country_code: 'EG', gasoline: 0.44, diesel: 0.36 },
    { country: 'Malaisie', country_code: 'MY', gasoline: 0.47, diesel: 0.43 },
    { country: 'Arabie Saoudite', country_code: 'SA', gasoline: 0.65, diesel: 0.14 },
    { country: 'Kazakhstan', country_code: 'KZ', gasoline: 0.52, diesel: 0.47 },
    { country: 'Nigéria', country_code: 'NG', gasoline: 0.57, diesel: 0.55 },
    { country: 'Indonésie', country_code: 'ID', gasoline: 0.70, diesel: 0.55 },
    { country: 'Russie', country_code: 'RU', gasoline: 0.72, diesel: 0.65 },
    { country: 'Chine', country_code: 'CN', gasoline: 1.12, diesel: 1.08 },
    { country: 'Inde', country_code: 'IN', gasoline: 1.27, diesel: 1.21 },
    { country: 'Mexique', country_code: 'MX', gasoline: 1.14, diesel: 1.11 },
    { country: 'Brésil', country_code: 'BR', gasoline: 1.22, diesel: 1.12 },
    { country: 'Afrique du Sud', country_code: 'ZA', gasoline: 1.19, diesel: 1.11 },
    { country: 'Argentine', country_code: 'AR', gasoline: 1.01, diesel: 0.92 },
    { country: 'États-Unis', country_code: 'US', gasoline: 1.04, diesel: 1.08 },
    { country: 'Canada', country_code: 'CA', gasoline: 1.46, diesel: 1.53 },
    { country: 'Australie', country_code: 'AU', gasoline: 1.58, diesel: 1.63 },
    { country: 'Japon', country_code: 'JP', gasoline: 1.48, diesel: 1.36 },
    { country: 'Corée du Sud', country_code: 'KR', gasoline: 1.53, diesel: 1.39 },
    { country: 'Espagne', country_code: 'ES', gasoline: 1.79, diesel: 1.72 },
    { country: 'Portugal', country_code: 'PT', gasoline: 1.83, diesel: 1.74 },
    { country: 'France', country_code: 'FR', gasoline: 1.97, diesel: 1.93 },
    { country: 'Italie', country_code: 'IT', gasoline: 1.94, diesel: 1.89 },
    { country: 'Allemagne', country_code: 'DE', gasoline: 1.92, diesel: 1.79 },
    { country: 'Royaume-Uni', country_code: 'GB', gasoline: 1.89, diesel: 1.95 },
    { country: 'Pays-Bas', country_code: 'NL', gasoline: 2.22, diesel: 1.96 },
    { country: 'Suède', country_code: 'SE', gasoline: 2.04, diesel: 2.11 },
    { country: 'Norvège', country_code: 'NO', gasoline: 2.23, diesel: 2.14 },
    { country: 'Danemark', country_code: 'DK', gasoline: 2.15, diesel: 1.98 },
    { country: 'Finlande', country_code: 'FI', gasoline: 2.09, diesel: 1.93 },
    { country: 'Suisse', country_code: 'CH', gasoline: 1.97, diesel: 1.88 },
    { country: 'Islande', country_code: 'IS', gasoline: 2.27, diesel: 2.19 },
    { country: 'Belgique', country_code: 'BE', gasoline: 1.89, diesel: 1.73 },
    { country: 'Luxembourg', country_code: 'LU', gasoline: 1.61, diesel: 1.47 },
    { country: 'Irlande', country_code: 'IE', gasoline: 1.96, diesel: 1.89 },
    { country: 'Autriche', country_code: 'AT', gasoline: 1.76, diesel: 1.69 },
    { country: 'Pologne', country_code: 'PL', gasoline: 1.51, diesel: 1.44 },
    { country: 'République Tchèque', country_code: 'CZ', gasoline: 1.65, diesel: 1.58 },
    { country: 'Hongrie', country_code: 'HU', gasoline: 1.72, diesel: 1.64 },
    { country: 'Turquie', country_code: 'TR', gasoline: 1.46, diesel: 1.49 },
    { country: 'Grèce', country_code: 'GR', gasoline: 1.99, diesel: 1.72 },
    { country: 'Singapour', country_code: 'SG', gasoline: 2.14, diesel: 1.65 },
    { country: 'Hong Kong', country_code: 'HK', gasoline: 3.17, diesel: 2.51 },
    { country: 'Nouvelle-Zélande', country_code: 'NZ', gasoline: 1.96, diesel: 1.71 },
    { country: 'Israël', country_code: 'IL', gasoline: 1.91, diesel: 1.64 },
    { country: 'Qatar', country_code: 'QA', gasoline: 0.60, diesel: 0.50 },
    { country: 'Émirats Arabes Unis', country_code: 'AE', gasoline: 0.77, diesel: 0.54 },
    { country: 'Oman', country_code: 'OM', gasoline: 0.60, diesel: 0.54 },
    { country: 'Irak', country_code: 'IQ', gasoline: 0.60, diesel: 0.41 },
    { country: 'Pakistan', country_code: 'PK', gasoline: 0.90, diesel: 0.88 },
    { country: 'Bangladesh', country_code: 'BD', gasoline: 1.07, diesel: 0.96 },
    { country: 'Sri Lanka', country_code: 'LK', gasoline: 1.09, diesel: 0.96 },
    { country: 'Thaïlande', country_code: 'TH', gasoline: 1.22, diesel: 1.03 },
    { country: 'Vietnam', country_code: 'VN', gasoline: 1.06, diesel: 0.88 },
    { country: 'Philippines', country_code: 'PH', gasoline: 1.15, diesel: 1.05 },
    { country: 'Colombie', country_code: 'CO', gasoline: 0.82, diesel: 0.71 },
    { country: 'Pérou', country_code: 'PE', gasoline: 1.21, diesel: 1.15 },
    { country: 'Chili', country_code: 'CL', gasoline: 1.41, diesel: 1.32 },
    { country: 'Ukraine', country_code: 'UA', gasoline: 1.44, diesel: 1.38 },
    { country: 'Roumanie', country_code: 'RO', gasoline: 1.62, diesel: 1.55 },
    { country: 'Maroc', country_code: 'MA', gasoline: 1.38, diesel: 1.14 },
    { country: 'Ghana', country_code: 'GH', gasoline: 1.07, diesel: 1.04 },
    { country: 'Kenya', country_code: 'KE', gasoline: 1.32, diesel: 1.20 },
    { country: 'Tanzanie', country_code: 'TZ', gasoline: 1.31, diesel: 1.17 },
    { country: 'Éthiopie', country_code: 'ET', gasoline: 0.78, diesel: 0.73 },
    { country: 'Cameroun', country_code: 'CM', gasoline: 1.46, diesel: 1.46 },
    { country: 'Côte d’Ivoire', country_code: 'CI', gasoline: 1.62, diesel: 1.37 },
    { country: 'Sénégal', country_code: 'SN', gasoline: 1.64, diesel: 1.34 },
  ];

  const insertStmt = db.prepare(`
    INSERT OR IGNORE INTO fuel_prices (country, country_code, gasoline, diesel, scraped_at)
    VALUES (@country, @country_code, @gasoline, @diesel, @scraped_at)
  `);
  const insertMany = db.transaction((records) => {
    for (const r of records) insertStmt.run({ ...r, scraped_at: today });
  });
  insertMany(seed);
  console.log(`✅ ${seed.length} pays de secours ajoutés`);
}

module.exports = { runScraper, seedFallbackData, COUNTRY_CODES };
