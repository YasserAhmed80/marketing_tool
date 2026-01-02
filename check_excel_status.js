import XLSX from 'xlsx';

const wb = XLSX.readFile('emails_verified_to_send.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws);

console.log('\n📊 Excel File Status Check\n');
console.log('='.repeat(60));
console.log('\nTotal emails:', data.length);

console.log('\n📋 Status breakdown:');
console.log('  ✅ Success:', data.filter(r => r.status === 'success').length);
console.log('  ❌ Failed:', data.filter(r => r.status === 'failed').length);
console.log('  ⏳ Pending:', data.filter(r => !r.status || r.status === '').length);

console.log('\n📧 Email count breakdown:');
const counts = {};
data.forEach(r => {
    const c = r.email_count || 0;
    counts[c] = (counts[c] || 0) + 1;
});
Object.keys(counts).sort((a, b) => a - b).forEach(c => {
    console.log(`  Sent ${c} time(s): ${counts[c]} emails`);
});

console.log('\n📝 Sample records:');
data.slice(0, 5).forEach((r, i) => {
    console.log(`  ${i + 1}. ${r.email}`);
    console.log(`     Status: "${r.status || 'empty'}"`);
    console.log(`     Count: ${r.email_count || 0}`);
    console.log(`     Reason: "${r.reason || 'empty'}"`);
});

console.log('\n' + '='.repeat(60) + '\n');
