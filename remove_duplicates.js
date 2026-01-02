import XLSX from 'xlsx';
import fs from 'fs';

const EXCEL_FILE = 'emails_data.xlsx';

console.log('\n🔍 Removing Duplicate Emails\n');
console.log('='.repeat(70));

try {
    // Read Excel file
    console.log('\n📂 Reading Excel file...');
    const workbook = XLSX.readFile(EXCEL_FILE);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log(`✓ Loaded ${data.length} records\n`);

    // Track duplicates
    const seen = new Map(); // email -> first occurrence
    const duplicates = [];
    const unique = [];

    console.log('🔎 Checking for duplicates...\n');

    data.forEach((record, index) => {
        // Normalize email: trim, lowercase, remove extra spaces
        const rawEmail = record.email || '';
        const normalizedEmail = rawEmail
            .toString()
            .trim()
            .toLowerCase()
            .replace(/\s+/g, ''); // Remove all spaces

        if (!normalizedEmail) {
            console.log(`⚠️  Row ${index + 1}: Empty email, skipping`);
            return;
        }

        // Check if we've seen this email before
        if (seen.has(normalizedEmail)) {
            const firstOccurrence = seen.get(normalizedEmail);
            duplicates.push({
                row: index + 1,
                email: rawEmail,
                normalized: normalizedEmail,
                firstSeen: firstOccurrence.row,
                name: record.name || 'N/A'
            });
            console.log(`❌ Duplicate found: ${rawEmail} (row ${index + 1}) - first seen at row ${firstOccurrence.row}`);
        } else {
            // First time seeing this email
            seen.set(normalizedEmail, {
                row: index + 1,
                record: record
            });
            unique.push(record);
        }
    });

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('\n📊 SUMMARY:\n');
    console.log(`   Total records processed: ${data.length}`);
    console.log(`   Unique emails: ${unique.length}`);
    console.log(`   Duplicates found: ${duplicates.length}`);
    console.log(`   Duplicates removed: ${duplicates.length}`);

    if (duplicates.length > 0) {
        console.log('\n📋 Duplicate Details:\n');

        // Group duplicates by email
        const groupedDuplicates = {};
        duplicates.forEach(dup => {
            if (!groupedDuplicates[dup.normalized]) {
                groupedDuplicates[dup.normalized] = [];
            }
            groupedDuplicates[dup.normalized].push(dup);
        });

        Object.entries(groupedDuplicates).forEach(([email, dups]) => {
            console.log(`   📧 ${email}:`);
            console.log(`      Found ${dups.length + 1} times (kept first, removed ${dups.length})`);
            dups.forEach(d => {
                console.log(`      - Row ${d.row}: ${d.email} (${d.name})`);
            });
            console.log('');
        });
    }

    // Save cleaned data
    if (duplicates.length > 0) {
        console.log('💾 Saving cleaned data...\n');

        // Create backup
        const backupFile = 'emails_data_backup.xlsx';
        fs.copyFileSync(EXCEL_FILE, backupFile);
        console.log(`✓ Backup created: ${backupFile}`);

        // Save cleaned data
        const newWorkbook = XLSX.utils.book_new();
        const newWorksheet = XLSX.utils.json_to_sheet(unique);
        XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Sheet1');
        XLSX.writeFile(newWorkbook, EXCEL_FILE);

        console.log(`✓ Cleaned data saved: ${EXCEL_FILE}`);
        console.log(`✓ Removed ${duplicates.length} duplicate(s)`);
        console.log(`✓ Kept ${unique.length} unique record(s)`);
    } else {
        console.log('\n✅ No duplicates found! Your list is clean.\n');
    }

    console.log('\n' + '='.repeat(70));

    // Final statistics
    console.log('\n📈 FINAL STATISTICS:\n');
    console.log(`   Before: ${data.length} records`);
    console.log(`   After: ${unique.length} records`);
    console.log(`   Reduction: ${data.length - unique.length} records (${((duplicates.length / data.length) * 100).toFixed(1)}%)`);
    console.log(`   Space saved: ${((duplicates.length / data.length) * 100).toFixed(1)}%`);

    console.log('\n' + '='.repeat(70) + '\n');

} catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nMake sure:');
    console.error('1. emails_data.xlsx exists');
    console.error('2. File is not open in Excel');
    console.error('3. File has data\n');
    process.exit(1);
}
