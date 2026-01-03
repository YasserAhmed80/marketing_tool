import XLSX from 'xlsx';

// Create sample data for testing
const sampleData = [
    { name: 'Egyptian Developers', phone: '+20 2 1234 5678', email: 'info@egyptdev.com', website: 'www.egyptdev.com', category: 'Real Estate Developer', city: 'Cairo', country: 'Egypt', scraped_date: '2026-01-02' },
    { name: 'Cairo Real Estate', phone: '+20 2 2345 6789', email: 'contact@cairore.com', website: 'www.cairore.com', category: 'Real Estate Broker', city: 'Cairo', country: 'Egypt', scraped_date: '2026-01-02' },
    { name: 'Nile Properties', phone: '+20 2 3456 7890', email: 'info@nileprops.com', website: 'www.nileprops.com', category: 'Property Developer', city: 'Cairo', country: 'Egypt', scraped_date: '2026-01-02' },
    { name: 'Pyramids Real Estate', phone: '+20 2 4567 8901', email: '', website: '', category: 'Real Estate Agency', city: 'Cairo', country: 'Egypt', scraped_date: '2026-01-02' },
    { name: 'Alexandria Developers', phone: '+20 3 1234 5678', email: 'info@alexdev.com', website: '', category: 'Real Estate Developer', city: 'Alexandria', country: 'Egypt', scraped_date: '2026-01-02' }
];

console.log('\n📝 Creating sample data for testing...\n');

const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet(sampleData);
XLSX.utils.book_append_sheet(wb, ws, 'Real Estate Leads');
XLSX.writeFile(wb, 'real_estate_leads.xlsx');

console.log(`✅ Created sample file with ${sampleData.length} businesses`);
console.log('\nNow refresh the web page to see the progress display!\n');
console.log('Open: http://localhost:3000/scraper.html\n');
