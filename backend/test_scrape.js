const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
  const url = 'https://fr.globalpetrolprices.com/gasoline_prices/';
  console.log('Fetching...', url);
  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });
    const $ = cheerio.load(data);
    const graphs = $('.graph_outside_link').length;
    console.log('Found graph links:', graphs);
    const results = [];
    $('.graph_outside_link').each((_, el) => {
        results.push({
            text: $(el).text().trim(),
            href: $(el).attr('href')
        });
    });
    require('fs').writeFileSync('debug_dom.json', JSON.stringify(results, null, 2));
    console.log('Dumped to debug_dom.json');
    
    // Check first few rows of any table
    $('table tbody tr').slice(0, 5).each((i, row) => {
      console.log(`Row ${i}:`, $(row).text().trim().replace(/\s+/g, ' '));
    });
  } catch (err) {
    console.error(err);
  }
}
test();
