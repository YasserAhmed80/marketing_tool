import XLSX from 'xlsx';

const EXCEL_FILE = 'emails_verified_to_send.xlsx';

console.log('\n📝 Adding Sending Columns to Excel\n');
console.log('='.repeat(70));

try {
    // Read Excel file
    console.log('\n📂 Reading Excel file...\n');
    const workbook = XLSX.readFile(EXCEL_FILE);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log(`✓ Loaded ${data.length} records\n`);

    // Add sending columns to each record
    console.log('📋 Adding columns...\n');

    data.forEach(record => {
        // Add sending columns if they don't exist
        if (!record.hasOwnProperty('email_count')) {
            record.email_count = 0;
        }
        if (!record.hasOwnProperty('status')) {
            record.status = '';
        }
        if (!record.hasOwnProperty('reason')) {
            record.reason = '';
        }
        if (!record.hasOwnProperty('sent_date')) {
            record.sent_date = '';
        }
    });

    // Save updated Excel file
    console.log('💾 Saving updated file...\n');

    const newWorkbook = XLSX.utils.book_new();
    const newWorksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Sheet1');
    XLSX.writeFile(newWorkbook, EXCEL_FILE);

    console.log('✅ Columns added successfully!\n');
    console.log('='.repeat(70));
    console.log('\n📊 Updated Columns:\n');
    console.log('   • name - Recipient name');
    console.log('   • email - Email address');
    console.log('   • zerobounce_status - Verification status');
    console.log('   • zerobounce_sub_status - Verification details');
    console.log('   • zerobounce_checked - Verification flag');
    console.log('   • zerobounce_check_date - Verification date');
    console.log('   • zerobounce_free_email - Free email provider flag');
    console.log('   • zerobounce_did_you_mean - Suggested correction');
    console.log('   • email_count - Number of times sent (NEW)');
    console.log('   • status - Send status: success/failed (NEW)');
    console.log('   • reason - Failure reason if any (NEW)');
    console.log('   • sent_date - Date when sent (NEW)');

    console.log('\n' + '='.repeat(70));
    console.log('\n✅ File is ready for sending!\n');
    console.log('📧 Total emails ready: ' + data.length);
    console.log('📧 Unsent emails: ' + data.filter(r => !r.status || r.status === '').length);
    console.log('\n' + '='.repeat(70) + '\n');

} catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
}
