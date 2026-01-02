import XLSX from 'xlsx';

// Sample data without mobile column
const sampleData = [
    {
        name: 'Yasser Ahmed',
        email: 'yasserahmed80@icloud.com',
        email_count: 0,
        status: '',
        reason: ''
    }
];

// Create workbook
const workbook = XLSX.utils.book_new();
const worksheet = XLSX.utils.json_to_sheet(sampleData);

// Add worksheet to workbook
XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

// Write to file
XLSX.writeFile(workbook, 'sample_data.xlsx');

console.log('✓ Sample Excel file created');
console.log(`  - Total records: ${sampleData.length}`);
console.log(`  - All records have empty status`);
console.log('\nRecords:');
sampleData.forEach((r, i) => {
    console.log(`  ${i + 1}. ${r.name} <${r.email}>`);
});
