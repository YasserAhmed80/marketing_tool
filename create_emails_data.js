import XLSX from 'xlsx';

// Create emails_data.xlsx with sample data
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
XLSX.writeFile(workbook, 'emails_data.xlsx');

console.log('✓ emails_data.xlsx created successfully');
console.log(`  - Total records: ${sampleData.length}`);
console.log('  - Ready for validation and sending');
