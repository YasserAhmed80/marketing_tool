import XLSX from 'xlsx';

console.log('\n📝 Creating Excel Template for Scraped Data\n');
console.log('='.repeat(70));

// Create template data with headers
const templateData = [
    {
        name: '',
        phone: '',
        email: '',
        country: '',
        city: '',
        category: '',
        scraped_date: ''
    }
];

// Create workbook
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet(templateData);

// Add worksheet to workbook
XLSX.utils.book_append_sheet(wb, ws, 'Real Estate Leads');

// Save file
const filename = 'real_estate_leads.xlsx';
XLSX.writeFile(wb, filename);

console.log('\n✅ Excel template created!\n');
console.log('📁 File: ' + filename);
console.log('\n📊 Columns:\n');
console.log('   1. name         - Business name');
console.log('   2. phone        - Phone number');
console.log('   3. email        - Email address');
console.log('   4. country      - Country name');
console.log('   5. city         - City name');
console.log('   6. category     - Business category');
console.log('   7. scraped_date - Date scraped (YYYY-MM-DD)');
console.log('\n' + '='.repeat(70));
console.log('\n✅ Ready to start scraping!\n');
console.log('Run: node google_maps_scraper.js\n');
