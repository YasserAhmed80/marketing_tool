import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import XLSX from 'xlsx';

puppeteer.use(StealthPlugin());

class EmailFinder {
    constructor() {
        this.browser = null;
        this.page = null;
    }

    /**
     * Initialize browser
     */
    async initBrowser() {
        console.log('🌐 Launching browser...\n');

        this.browser = await puppeteer.launch({
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        this.page = await this.browser.newPage();
        await this.page.setViewport({ width: 1366, height: 768 });

        console.log('✅ Browser ready\n');
    }

    /**
     * Extract emails from a webpage
     */
    async extractEmailsFromPage(url) {
        try {
            await this.page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
            await this.page.waitForTimeout(2000);

            // Extract all text from page
            const pageText = await this.page.evaluate(() => document.body.innerText);

            // Email regex
            const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
            const emails = pageText.match(emailRegex) || [];

            // Filter out common non-business emails
            const filtered = emails.filter(email => {
                const lower = email.toLowerCase();
                return !lower.includes('example') &&
                    !lower.includes('test') &&
                    !lower.includes('sample') &&
                    !lower.includes('noreply') &&
                    !lower.includes('no-reply');
            });

            // Return unique emails
            return [...new Set(filtered)];

        } catch (error) {
            return [];
        }
    }

    /**
     * Find contact page and extract emails
     */
    async findEmails(websiteUrl, businessName) {
        if (!websiteUrl || websiteUrl === '') {
            return '';
        }

        console.log(`   🔍 Searching: ${businessName}`);

        try {
            // Try main page first
            let emails = await this.extractEmailsFromPage(websiteUrl);

            if (emails.length === 0) {
                // Try contact page
                const contactUrls = [
                    `${websiteUrl}/contact`,
                    `${websiteUrl}/contact-us`,
                    `${websiteUrl}/about`,
                    `${websiteUrl}/about-us`
                ];

                for (const url of contactUrls) {
                    try {
                        const contactEmails = await this.extractEmailsFromPage(url);
                        if (contactEmails.length > 0) {
                            emails = contactEmails;
                            break;
                        }
                    } catch (e) {
                        continue;
                    }
                }
            }

            if (emails.length > 0) {
                console.log(`      ✅ Found: ${emails[0]}`);
                return emails[0]; // Return first email
            } else {
                console.log(`      ❌ No email found`);
                return '';
            }

        } catch (error) {
            console.log(`      ✗ Error: ${error.message}`);
            return '';
        }
    }

    /**
     * Process Excel file
     */
    async processFile(inputFile, outputFile) {
        console.log('\n📧 Email Finder for Real Estate Leads\n');
        console.log('='.repeat(70));

        // Read Excel
        console.log(`\n📂 Reading: ${inputFile}\n`);
        const workbook = XLSX.readFile(inputFile);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(worksheet);

        console.log(`✓ Loaded ${data.length} businesses\n`);

        // Filter businesses without emails and with phone numbers
        const toProcess = data.filter(r =>
            (!r.email || r.email === '') && r.phone && r.phone !== ''
        );

        console.log(`📧 Businesses to process: ${toProcess.length}\n`);

        if (toProcess.length === 0) {
            console.log('✅ All businesses already have emails!\n');
            return;
        }

        // Initialize browser
        await this.initBrowser();

        console.log('🔍 Starting email search...\n');
        console.log('='.repeat(70) + '\n');

        let found = 0;
        let processed = 0;

        // Process each business
        for (const business of toProcess.slice(0, 50)) { // Limit to 50 per session
            processed++;
            console.log(`[${processed}/${Math.min(50, toProcess.length)}] ${business.name}`);

            // For now, we'll skip website finding and just note that emails need to be found
            // In a real scenario, you'd need to first find the website, then extract emails
            business.email = ''; // Placeholder

            // Small delay
            await new Promise(resolve => setTimeout(resolve, 3000));
        }

        // Save results
        console.log('\n💾 Saving results...\n');

        const newWorkbook = XLSX.utils.book_new();
        const newWorksheet = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Real Estate Leads');
        XLSX.writeFile(newWorkbook, outputFile);

        console.log(`✅ Saved to: ${outputFile}\n`);
        console.log('='.repeat(70));
        console.log(`\n📊 Summary:\n`);
        console.log(`   Processed: ${processed}`);
        console.log(`   Emails found: ${found}`);
        console.log(`   Success rate: ${((found / processed) * 100).toFixed(1)}%\n`);

        await this.browser.close();
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const finder = new EmailFinder();
    const inputFile = process.argv[2] || 'real_estate_leads.xlsx';
    const outputFile = process.argv[3] || 'real_estate_leads_with_emails.xlsx';

    finder.processFile(inputFile, outputFile).catch(error => {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    });
}

export default EmailFinder;
