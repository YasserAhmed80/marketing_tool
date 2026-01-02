import XLSX from 'xlsx';

const EXCEL_FILE = 'emails_verified_to_send.xlsx';
const EMAILS_TO_MARK = 200;
const SENT_DATE = '2026-01-02';

console.log('\n📝 Updating First 200 Emails as Sent\n');
console.log('='.repeat(70));

try {
    // Read Excel file
    console.log('\n📂 Reading Excel file...\n');
    const workbook = XLSX.readFile(EXCEL_FILE);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log(`✓ Loaded ${data.length} records\n`);

    // Get first 200 emails
    const emailsToUpdate = data.slice(0, EMAILS_TO_MARK);

    console.log(`📧 Updating first ${emailsToUpdate.length} emails...\n`);

    // Update each record
    let updated = 0;
    emailsToUpdate.forEach((record, index) => {
        record.status = 'success';
        record.email_count = 1;
        record.reason = '';
        record.sent_date = SENT_DATE;
        updated++;

        if ((index + 1) % 50 === 0) {
            console.log(`  ✓ Updated ${index + 1}/${emailsToUpdate.length} emails...`);
        }
    });

    console.log(`\n✅ Updated ${updated} emails\n`);

    // Save updated Excel file
    console.log('💾 Saving updated file...\n');

    const newWorkbook = XLSX.utils.book_new();
    const newWorksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Sheet1');
    XLSX.writeFile(newWorkbook, EXCEL_FILE);

    console.log('✅ File saved successfully!\n');
    console.log('='.repeat(70));

    // Summary
    console.log('\n📊 SUMMARY:\n');
    console.log(`   Total records: ${data.length}`);
    console.log(`   Marked as sent: ${updated}`);
    console.log(`   Status: success`);
    console.log(`   Email count: 1`);
    console.log(`   Sent date: ${SENT_DATE}`);
    console.log(`   Remaining unsent: ${data.length - updated}`);

    console.log('\n' + '='.repeat(70));

    // Verification
    console.log('\n✅ VERIFICATION:\n');
    const sent = data.filter(r => r.status === 'success').length;
    const pending = data.filter(r => !r.status || r.status === '').length;
    console.log(`   ✅ Successfully sent: ${sent}`);
    console.log(`   ⏳ Pending: ${pending}`);

    console.log('\n' + '='.repeat(70) + '\n');

} catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nMake sure:');
    console.error('1. emails_verified_to_send.xlsx exists');
    console.error('2. File is NOT open in Excel');
    console.error('3. You have write permissions\n');
    process.exit(1);
}
