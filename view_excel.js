import XLSX from 'xlsx';

const wb = XLSX.readFile('sample_data.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws);

console.log('\n📊 Excel File Contents After Processing:\n');
console.log('='.repeat(80));

data.forEach((record, index) => {
    console.log(`\n${index + 1}. ${record.name || '(empty)'}`);
    console.log(`   Email: ${record.email || '(empty)'}`);
    console.log(`   Status: ${record.status || '(empty)'}`);
    console.log(`   Email Count: ${record.email_count || 0}`);
    console.log(`   Reason: ${record.reason || 'N/A'}`);
});

console.log('\n' + '='.repeat(80));

// Summary
const summary = {
    total: data.length,
    success: data.filter(r => r.status === 'success').length,
    failed: data.filter(r => r.status === 'failed').length,
    empty: data.filter(r => !r.status || r.status === '').length
};

console.log('\n📈 Summary:');
console.log(`   Total Records: ${summary.total}`);
console.log(`   ✓ Success: ${summary.success}`);
console.log(`   ✗ Failed: ${summary.failed}`);
console.log(`   ○ Empty Status: ${summary.empty}`);
console.log('');
