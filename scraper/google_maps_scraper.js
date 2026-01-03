import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import XLSX from 'xlsx';
import config from './config.js';
import readline from 'readline';

puppeteer.use(StealthPlugin());

class GoogleMapsScraper {
    constructor() {
        this.results = [];
        this.processedCount = 0;
        this.sessionCount = 0;
        this.browser = null;
        this.page = null;
    }

    /**
     * Check if VPN is connected
     */
    async checkVPN() {
        // Auto-confirm if running from web interface
        if (process.env.SCRAPER_AUTO === 'true') {
            console.log('\n✅ VPN check skipped (auto-mode)\n');
            return;
        }

        console.log('\n🔒 VPN Check\n');
        console.log('⚠️  IMPORTANT: Make sure your VPN is connected!');
        console.log('⚠️  This will protect your IP from being blocked.\n');
        console.log('Recommended: ProtonVPN (free)\n');

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        return new Promise((resolve) => {
            rl.question('Is your VPN connected? (yes/no): ', (answer) => {
                rl.close();
                if (answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'y') {
                    console.log('\n❌ Please connect to VPN first!\n');
                    process.exit(0);
                }
                console.log('\n✅ Proceeding with scraping...\n');
                resolve();
            });
        });
    }

    /**
     * Random delay
     */
    async randomDelay() {
        const delay = Math.floor(
            Math.random() * (config.safety.randomDelayMax - config.safety.randomDelayMin + 1)
        ) + config.safety.randomDelayMin;

        console.log(`   ⏳ Waiting ${(delay / 1000).toFixed(1)}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    /**
     * Initialize browser
     */
    async initBrowser() {
        console.log('🌐 Launching browser...\n');

        const userAgent = config.userAgents[Math.floor(Math.random() * config.userAgents.length)];

        this.browser = await puppeteer.launch({
            headless: false, // Visible browser (less suspicious)
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                `--user-agent=${userAgent}`
            ]
        });

        this.page = await this.browser.newPage();
        await this.page.setViewport({ width: 1366, height: 768 });

        console.log('✅ Browser ready\n');
    }

    /**
     * Search Google Maps
     */
    async searchGoogleMaps(keyword, city, country) {
        const searchQuery = `${keyword} in ${city}, ${country}`;
        console.log(`\n🔍 Searching: ${searchQuery}`);

        const url = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`;

        try {
            await this.page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
            await this.page.waitForTimeout(config.scraping.delayBetweenSearches);

            // Scroll to load more results
            await this.scrollResults();

            // Extract business data
            const businesses = await this.extractBusinesses(city, country);

            console.log(`   ✓ Found ${businesses.length} businesses`);

            return businesses;

        } catch (error) {
            console.error(`   ✗ Error searching: ${error.message}`);
            return [];
        }
    }

    /**
     * Scroll to load more results
     */
    async scrollResults() {
        console.log('   📜 Loading more results...');

        const scrollSelector = 'div[role="feed"]';

        for (let i = 0; i < config.scraping.maxScrolls; i++) {
            try {
                await this.page.evaluate((selector) => {
                    const scrollable = document.querySelector(selector);
                    if (scrollable) {
                        scrollable.scrollTop = scrollable.scrollHeight;
                    }
                }, scrollSelector);

                await this.page.waitForTimeout(config.scraping.scrollDelay);
            } catch (error) {
                break;
            }
        }
    }

    /**
     * Extract business data from current page
     */
    async extractBusinesses(city, country) {
        try {
            const businesses = await this.page.evaluate(() => {
                const results = [];
                const items = document.querySelectorAll('div[role="article"]');

                items.forEach(item => {
                    try {
                        // Extract name
                        const nameEl = item.querySelector('div.fontHeadlineSmall');
                        const name = nameEl ? nameEl.textContent.trim() : '';

                        if (!name) return;

                        // Extract phone (if visible)
                        const phoneRegex = /[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}/g;
                        const text = item.textContent;
                        const phoneMatch = text.match(phoneRegex);
                        const phone = phoneMatch ? phoneMatch[0] : '';

                        // Extract category
                        const categoryEl = item.querySelector('div.fontBodyMedium > div > span:first-child');
                        const category = categoryEl ? categoryEl.textContent.trim() : '';

                        results.push({
                            name,
                            phone,
                            category
                        });
                    } catch (e) {
                        // Skip this item
                    }
                });

                return results;
            });

            // Add city and country
            return businesses.map(b => ({
                ...b,
                city,
                country,
                email: '', // Will be filled later
                scraped_date: new Date().toISOString().split('T')[0]
            }));

        } catch (error) {
            console.error(`   ✗ Error extracting: ${error.message}`);
            return [];
        }
    }

    /**
     * Save results to Excel
     */
    saveResults() {
        console.log('\n💾 Saving results...');

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(this.results);
        XLSX.utils.book_append_sheet(wb, ws, 'Real Estate Leads');
        XLSX.writeFile(wb, config.output.filename);

        console.log(`✅ Saved ${this.results.length} results to ${config.output.filename}\n`);
    }

    /**
     * Main scraping function
     */
    async scrape() {
        console.log('\n🚀 Google Maps Real Estate Scraper\n');
        console.log('='.repeat(70));

        // VPN check
        if (config.safety.requireVPN) {
            await this.checkVPN();
        }

        // Initialize browser
        await this.initBrowser();

        console.log('📊 Target Summary:\n');
        console.log(`   Countries: ${Object.keys(config.countries).length}`);
        console.log(`   Keywords: ${config.keywords.length}`);
        console.log(`   Session limit: ${config.scraping.sessionLimit} businesses`);
        console.log('\n' + '='.repeat(70) + '\n');

        // Check if specific country requested via environment
        const targetCountry = process.env.SCRAPER_COUNTRY;
        const sessionLimit = process.env.SCRAPER_LIMIT ? parseInt(process.env.SCRAPER_LIMIT) : config.scraping.sessionLimit;

        // Filter countries if specific one requested
        const countriesToScrape = targetCountry
            ? { [targetCountry]: config.countries[targetCountry] }
            : config.countries;

        // Scrape each country
        for (const [country, cities] of Object.entries(countriesToScrape)) {
            console.log(`\n🌍 ${country}\n`);

            // Scrape each city
            for (const city of cities) {
                console.log(`\n📍 ${city}`);

                // Scrape each keyword
                for (const keyword of config.keywords) {
                    // Check session limit
                    if (this.sessionCount >= config.scraping.sessionLimit) {
                        console.log(`\n⚠️  Session limit reached (${config.scraping.sessionLimit})`);
                        console.log('💾 Saving progress...');
                        this.saveResults();
                        console.log('\n✅ Session complete!');
                        console.log(`📊 Total scraped: ${this.results.length} businesses`);
                        console.log('\n💡 Tips:');
                        console.log('   1. Wait 1 hour before next session');
                        console.log('   2. Change VPN server');
                        console.log('   3. Run script again to continue\n');
                        await this.browser.close();
                        return;
                    }

                    // Search and extract
                    const businesses = await this.searchGoogleMaps(keyword, city, country);

                    // Add to results (avoid duplicates)
                    businesses.forEach(b => {
                        const exists = this.results.some(r =>
                            r.name === b.name && r.city === b.city
                        );
                        if (!exists) {
                            this.results.push(b);
                            this.sessionCount++;
                        }
                    });

                    // Save progress every batch
                    if (this.results.length % config.scraping.batchSize === 0) {
                        this.saveResults();
                    }

                    // Random delay between searches
                    await this.randomDelay();
                }
            }
        }

        // Final save
        this.saveResults();

        console.log('\n' + '='.repeat(70));
        console.log('\n✅ Scraping Complete!\n');
        console.log(`📊 Total Results: ${this.results.length}`);
        console.log(`📁 Saved to: ${config.output.filename}\n`);
        console.log('💡 Next Steps:');
        console.log('   1. Run email finder: node email_finder.js');
        console.log('   2. Verify emails with ZeroBounce');
        console.log('   3. Import to your email tool\n');
        console.log('='.repeat(70) + '\n');

        await this.browser.close();
    }
}

// Run scraper
const scraper = new GoogleMapsScraper();
scraper.scrape().catch(error => {
    console.error('\n❌ Fatal Error:', error.message);
    process.exit(1);
});
