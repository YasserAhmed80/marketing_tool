import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FILES_DIR = path.join(__dirname, 'src', 'public', 'files');
const DONE_DIR = path.join(FILES_DIR, 'done');
const OUTPUT_FILE = path.join(__dirname, 'emails_data.xlsx');

// Ensure done directory exists
if (!fs.existsSync(DONE_DIR)) {
    fs.mkdirSync(DONE_DIR, { recursive: true });
}

/**
 * Extract name and email from a row object
 */
function extractNameAndEmail(row) {
    const result = { name: '', email: '' };

    // Common column name variations (English and Arabic)
    const nameColumns = [
        'name', 'Name', 'NAME',
        'الاسم', 'اسم', 'اسم الشركة', 'الشركة', 'شركة',
        'company', 'Company', 'COMPANY',
        'Company Name', 'company name', 'CompanyName'
    ];

    const emailColumns = [
        'email', 'Email', 'EMAIL', 'e-mail', 'E-mail', 'E-Mail',
        'البريد', 'بريد', 'البريد الالكتروني', 'البريد الإلكتروني',
        'Email Address', 'email address', 'EmailAddress'
    ];

    // Find name
    for (const col of nameColumns) {
        if (row[col] && row[col].toString().trim()) {
            result.name = row[col].toString().trim();
            break;
        }
    }

    // Find email
    for (const col of emailColumns) {
        if (row[col] && row[col].toString().trim()) {
            const emailValue = row[col].toString().trim().toLowerCase();
            // Clean up email (remove any extra spaces or special characters)
            result.email = emailValue.replace(/\s+/g, '');
            break;
        }
    }

    // If no specific columns found, try to find email pattern in any column
    if (!result.email) {
        for (const key in row) {
            const value = row[key]?.toString() || '';
            if (value.includes('@') && value.includes('.')) {
                result.email = value.trim().toLowerCase().replace(/\s+/g, '');
                break;
            }
        }
    }

    // If still no name, use first non-empty column that's not email
    if (!result.name && result.email) {
        for (const key in row) {
            const value = row[key]?.toString() || '';
            if (value && value.trim() && !value.includes('@')) {
                result.name = value.trim();
                break;
            }
        }
    }

    return result;
}

/**
 * Process a single file
 */
function processFile(filePath) {
    const fileName = path.basename(filePath);
    const ext = path.extname(filePath).toLowerCase();

    console.log(`\n📄 Processing: ${fileName}`);

    try {
        let data = [];

        // Read file based on extension
        if (ext === '.xlsx' || ext === '.xls' || ext === '.ods') {
            const workbook = XLSX.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            data = XLSX.utils.sheet_to_json(worksheet);
            console.log(`   📊 Read ${data.length} rows from Excel`);
        } else if (ext === '.txt' || ext === '.csv') {
            const content = fs.readFileSync(filePath, 'utf-8');
            const lines = content.split('\n');

            // Try to parse as CSV/TSV
            const delimiter = content.includes('\t') ? '\t' : ',';
            const headers = lines[0].split(delimiter).map(h => h.trim());

            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;
                const values = lines[i].split(delimiter);
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = values[index]?.trim() || '';
                });
                data.push(row);
            }
            console.log(`   📊 Read ${data.length} rows from text file`);
        } else if (ext === '.pdf') {
            console.log(`   ⚠️  PDF files not supported, skipping...`);
            return { processed: 0, fileName };
        } else {
            console.log(`   ⚠️  Unsupported file type: ${ext}`);
            return { processed: 0, fileName };
        }

        // Extract name and email from each row
        const extracted = [];
        let validCount = 0;

        for (const row of data) {
            const { name, email } = extractNameAndEmail(row);

            if (name && email && email.includes('@') && email.includes('.')) {
                extracted.push({
                    name,
                    email,
                    email_count: 0,
                    status: '',
                    reason: '',
                    validation_status: '',
                    validation_reason: ''
                });
                validCount++;
            }
        }

        console.log(`   ✓ Extracted ${validCount} valid records with name and email`);

        return { processed: validCount, fileName, data: extracted };

    } catch (error) {
        console.log(`   ✗ Error processing file: ${error.message}`);
        return { processed: 0, fileName, error: error.message };
    }
}

/**
 * Main processing function
 */
async function processAllFiles() {
    console.log('\n🚀 Starting Batch File Processing\n');
    console.log('='.repeat(60));

    // Read all files in directory
    const files = fs.readdirSync(FILES_DIR)
        .filter(f => {
            const filePath = path.join(FILES_DIR, f);
            return fs.statSync(filePath).isFile();
        })
        .map(f => path.join(FILES_DIR, f));

    console.log(`\n📁 Found ${files.length} files to process\n`);

    if (files.length === 0) {
        console.log('No files to process!');
        return;
    }

    // Load existing emails_data.xlsx or create new
    let existingData = [];
    if (fs.existsSync(OUTPUT_FILE)) {
        try {
            const workbook = XLSX.readFile(OUTPUT_FILE);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            existingData = XLSX.utils.sheet_to_json(worksheet);
            console.log(`📊 Loaded ${existingData.length} existing records from emails_data.xlsx\n`);
        } catch (error) {
            console.log('⚠️  Could not load existing file, will create new one\n');
        }
    }

    // Process each file
    let totalProcessed = 0;
    const results = [];

    for (const filePath of files) {
        const result = processFile(filePath);
        results.push(result);

        if (result.data && result.data.length > 0) {
            // Add to existing data (avoid duplicates)
            const existingEmails = new Set(existingData.map(r => r.email?.toLowerCase()));
            const newRecords = result.data.filter(r => !existingEmails.has(r.email.toLowerCase()));

            existingData.push(...newRecords);
            totalProcessed += newRecords.length;

            console.log(`   ✓ Added ${newRecords.length} new unique records (${result.data.length - newRecords.length} duplicates skipped)`);

            // Move file to done folder
            try {
                const doneFilePath = path.join(DONE_DIR, result.fileName);
                fs.renameSync(filePath, doneFilePath);
                console.log(`   ✓ Moved to done folder`);
            } catch (error) {
                console.log(`   ⚠️  Could not move file: ${error.message}`);
            }
        }
    }

    // Save updated emails_data.xlsx
    if (totalProcessed > 0) {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(existingData);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        XLSX.writeFile(workbook, OUTPUT_FILE);

        console.log('\n' + '='.repeat(60));
        console.log(`\n✅ Processing Complete!`);
        console.log(`   Total files processed: ${results.filter(r => r.processed > 0).length}`);
        console.log(`   New records added: ${totalProcessed}`);
        console.log(`   Total records in emails_data.xlsx: ${existingData.length}`);
        console.log(`   Files moved to done folder: ${results.filter(r => r.processed > 0).length}\n`);
    } else {
        console.log('\n⚠️  No new records were added\n');
    }

    // Summary
    console.log('\n📋 File Processing Summary:\n');
    results.forEach(r => {
        const status = r.processed > 0 ? '✅' : (r.error ? '❌' : '⚠️');
        console.log(`   ${status} ${r.fileName}: ${r.processed} records`);
        if (r.error) console.log(`      Error: ${r.error}`);
    });

    console.log('\n' + '='.repeat(60) + '\n');
}

// Run the processor
processAllFiles().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
