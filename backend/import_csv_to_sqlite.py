import csv
import sqlite3
import pycountry
import unicodedata

# Correction manuelle pour certains noms de pays en français
corrections = {
    "Danemark": "Denmark",
    "Pays Bas": "Netherlands",
    "Norvège": "Norway",
    "Israël": "Israel",
    "Allemagne": "Germany",
    "Albanie": "Albania",
    "Suisse": "Switzerland",
    "Liechtenstein": "Liechtenstein",
    "Grèce": "Greece",
    "France": "France",
    "Finlande": "Finland",
    "Portugal": "Portugal",
    "Italie": "Italy",
    "Monaco": "Monaco",
    "Irlande": "Ireland",
    "Espagne": "Spain",
    "Belgique": "Belgium",
    "Autriche": "Austria",
    "Estonie": "Estonia",
    "Suède": "Sweden",
    "Roumanie": "Romania",
    "Luxembourg": "Luxembourg",
    "Lettonie": "Latvia",
    "Saint Marin": "San Marino",
    "Uruguay": "Uruguay",
    "Barbade": "Barbados",
    "Royaume Uni": "United Kingdom",
    "Rép. centrafricaine": "Central African Republic",
    "Serbie": "Serbia",
    "Lituanie": "Lithuania",
    "Laos": "Laos",
    "Hongrie": "Hungary",
    "Pologne": "Poland",
    "Croatie": "Croatia",
    "Belize": "Belize",
    "Slovaquie": "Slovakia",
    "Islande": "Iceland",
    "Zimbabwe": "Zimbabwe",
    "Tchéquie": "Czechia",
    "Monténégro": "Montenegro",
    "Andorre": "Andorra",
    "Australie": "Australia",
    "Slovénie": "Slovenia",
    "Chypre": "Cyprus",
    "Sierra Leone": "Sierra Leone",
    "Ukraine": "Ukraine",
    "Sénégal": "Senegal",
    "Nouvelle Zélande": "New Zealand",
    "Malte": "Malta",
    "Pérou": "Peru",
    "Bulgarie": "Bulgaria",
    "Burkina Faso": "Burkina Faso",
    "Macédoine du Nord": "North Macedonia",
    "Jordanie": "Jordan",
    "Îles Caïmans": "Cayman Islands",
    "Cameroun": "Cameroon",
    "Bahamas": "Bahamas",
    "Moldavie": "Moldova",
    "Côte d'Ivoire": "Ivory Coast",
    "Seychelles": "Seychelles",
    "Turquie": "Turkey",
    "Chine": "China",
    "Mexique": "Mexico",
    "Brésil": "Brazil",
    "Canada": "Canada",
    "Corée du Sud": "South Korea",
    "Afrique du Sud": "South Africa",
    "Argentine": "Argentina",
    "Japon": "Japan",
    "Inde": "India",
    "États Unis": "United States",
    "Russie": "Russia",
    "Hong Kong": "Hong Kong"
}

def normalize(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn')

def get_country_codes(name):
    name = normalize(name)
    name = name.strip()
    if name in corrections:
        lookup = corrections[name]
    else:
        lookup = name
    try:
        country = pycountry.countries.lookup(lookup)
        return country.alpha_2, country.alpha_3
    except LookupError:
        return '', ''

# Enrichir le CSV
with open('prix_essence_monde.csv', encoding='utf-8') as infile, \
     open('prix_essence_monde_enriched.csv', 'w', encoding='utf-8', newline='') as outfile:
    reader = csv.DictReader(infile, delimiter=';')
    fieldnames = reader.fieldnames
    if 'country_Code' not in fieldnames:
        fieldnames.append('country_Code')
    if 'Country_Code_iso3' not in fieldnames:
        fieldnames.append('Country_Code_iso3')
    writer = csv.DictWriter(outfile, fieldnames=fieldnames, delimiter=';')
    writer.writeheader()
    enriched_rows = []
    for row in reader:
        country = row['country'].strip()
        code2, code3 = get_country_codes(country)
        row['country_Code'] = code2
        row['Country_Code_iso3'] = code3
        writer.writerow(row)
        enriched_rows.append(row)

# Insérer dans SQLite
conn = sqlite3.connect('fuel_prices.db')
cur = conn.cursor()
for row in enriched_rows:
    try:
        gasoline = float(row['gasoline'].replace(',', '.')) if row['gasoline'] else None
    except:
        gasoline = None
    try:
        diesel = float(row['diesel'].replace(',', '.')) if row['diesel'] else None
    except:
        diesel = None
    cur.execute('''
        INSERT OR IGNORE INTO fuel_prices
        (country, country_code, country_code_iso3, gasoline, diesel, currency, scraped_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (
        row['country'].strip(),
        row['country_Code'],
        row['Country_Code_iso3'],
        gasoline,
        diesel,
        row['currency'],
        row['scraped_at']
    ))
conn.commit()
conn.close()
print("Import terminé. Fichier enrichi : prix_essence_monde_enriched.csv")