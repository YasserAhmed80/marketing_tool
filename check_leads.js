import XLSX from 'xlsx';

const wb = XLSX.readFile('real_estate_leads.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws);

console.log('\n📊 Real Estate Leads File Check\n');
console.log('='.repeat(60));
console.log('\nTotal rows:', data.length);

if (data.length > 0) {
    console.log('\n✅ File has data!\n');
    console.log('Sample records:\n');

    data.slice(0, 5).forEach((r, i) => {
        console.log(`${i + 1}. ${r.name}`);
        console.log(`   Phone: ${r.phone || 'N/A'}`);
        console.log(`   Email: ${r.email || 'N/A'}`);
        console.log(`   City: ${r.city}`);
        console.log(`   Category: ${r.category || 'N/A'}`);
        console.log('');
    });

    console.log('='.repeat(60));
    console.log('\n📊 Summary:');
    console.log(`   Total: ${data.length}`);
    console.log(`   With Phone: ${data.filter(r => r.phone && r.phone !== '').length}`);
    console.log(`   With Email: ${data.filter(r => r.email && r.email !== '').length}`);
    console.log('');
} else {
    console.log('\n❌ File is empty!\n');
}
