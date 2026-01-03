import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import XLSX from 'xlsx';
import config from './config.js';

puppeteer.use(StealthPlugin());

console.log('\n🚀 Google Maps Scraper - WORKING VERSION\n');
console.log('='.repeat(70));

const targetCountry = process.env.SCRAPER_COUNTRY || 'Egypt';
const limit = parseInt(process.env.SCRAPER_LIMIT || '20');

console.log(`\n📊 Target: ${targetCountry}`);
console.log(`   Limit: ${limit} businesses\n`);

const results = [];

async function scrape() {
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });

    console.log('✅ Browser ready\n');

    const city = config.countries[targetCountry][0]; // First city
    const keyword = 'real estate developer';
    const searchQuery = `${keyword} in ${city}, ${targetCountry}`;

    console.log(`🔍 Searching: ${searchQuery}\n`);

    const url = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`;
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    await page.waitForTimeout(5000);

    console.log('📜 Extracting businesses...\n');

    // Extract businesses
    const businesses = await page.evaluate((city, country) => {
        const results = [];
        const items = document.querySelectorAll('a.hfpxzc');

        items.forEach((item, index) => {
            try {
                const ariaLabel = item.getAttribute('aria-label');
                if (!ariaLabel) return;

                results.push({
                    name: ariaLabel,
                    phone: '',
                    email: '',
                    website: '',
                    category: 'Real Estate',
                    city: city,
                    country: country,
                    scraped_date: new Date().toISOString().split('T')[0]
                });
            } catch (e) {
                // Skip
            }
        });

        return results;
    }, city, targetCountry);

    console.log(`✅ Found ${businesses.length} businesses\n`);

    // Add to results
    businesses.slice(0, limit).forEach((b, i) => {
        results.push(b);
        console.log(`[${i + 1}/${limit}] ${b.name}`);
    });

    // Save to Excel
    console.log('\n💾 Saving to Excel...\n');

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(results);
    XLSX.utils.book_append_sheet(wb, ws, 'Real Estate Leads');
    XLSX.writeFile(wb, config.output.filename);

    console.log(`✅ Saved ${results.length} businesses to ${config.output.filename}\n`);
    console.log('='.repeat(70) + '\n');

    await browser.close();
}

scrape().catch(error => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
});
