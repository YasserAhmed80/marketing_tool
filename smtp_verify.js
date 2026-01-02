import net from 'net';
import dns from 'dns';
import { promisify } from 'util';
import XLSX from 'xlsx';
import readline from 'readline';

const resolveMx = promisify(dns.resolveMx);

// Configuration
const BATCH_SIZE = 50; // Max emails per run
const MIN_DELAY = 5000; // 5 seconds
const MAX_DELAY = 15000; // 15 seconds
const TIMEOUT = 10000; // 10 seconds per check
const EXCEL_FILE = 'emails_data.xlsx';

// Skip these providers (they lie)
const SKIP_PROVIDERS = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com'];

/**
 * Check if VPN is likely active (basic check)
 */
async function checkVPN() {
    console.log('\n🔒 VPN Check\n');
    console.log('⚠️  IMPORTANT: Make sure your VPN is connected!');
    console.log('⚠️  This will use your current IP address.');
    console.log('\nTo verify your VPN:');
    console.log('1. Visit: https://whatismyipaddress.com');
    console.log('2. Check if IP is from VPN provider\n');

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question('Is your VPN connected? (yes/no): ', (answer) => {
            rl.close();
            if (answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'y') {
                console.log('\n❌ Please connect to VPN first!\n');
                process.exit(0);
            }
            console.log('\n✅ Proceeding with verification...\n');
            resolve();
        });
    });
}

/**
 * Random delay between checks
 */
function randomDelay() {
    const delay = Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY + 1)) + MIN_DELAY;
    return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * SMTP verification for a single email
 */
async function verifySMTP(email) {
    const domain = email.split('@')[1];

    // Skip big providers
    if (SKIP_PROVIDERS.includes(domain.toLowerCase())) {
        return {
            email,
            status: 'skipped',
            reason: 'Big provider (they lie about mailbox existence)'
        };
    }

    try {
        // Get MX records
        const mxRecords = await resolveMx(domain);
        if (!mxRecords || mxRecords.length === 0) {
            return {
                email,
                status: 'invalid',
                reason: 'No MX records'
            };
        }

        // Sort by priority
        mxRecords.sort((a, b) => a.priority - b.priority);
        const mxHost = mxRecords[0].exchange;

        // Try SMTP connection
        return new Promise((resolve) => {
            const socket = net.createConnection(25, mxHost);
            let response = '';
            let step = 0;

            const timeout = setTimeout(() => {
                socket.destroy();
                resolve({
                    email,
                    status: 'unknown',
                    reason: 'Timeout'
                });
            }, TIMEOUT);

            socket.on('data', (data) => {
                response = data.toString();

                if (step === 0 && response.includes('220')) {
                    // Server ready
                    socket.write(`HELO verify.local\r\n`);
                    step = 1;
                } else if (step === 1 && response.includes('250')) {
                    // HELO accepted
                    socket.write(`MAIL FROM:<verify@example.com>\r\n`);
                    step = 2;
                } else if (step === 2 && response.includes('250')) {
                    // MAIL FROM accepted
                    socket.write(`RCPT TO:<${email}>\r\n`);
                    step = 3;
                } else if (step === 3) {
                    clearTimeout(timeout);
                    socket.write('QUIT\r\n');
                    socket.end();

                    // Check response
                    if (response.includes('250')) {
                        resolve({
                            email,
                            status: 'valid',
                            reason: 'Mailbox exists'
                        });
                    } else if (response.includes('550') || response.includes('551') || response.includes('553')) {
                        resolve({
                            email,
                            status: 'invalid',
                            reason: 'Mailbox does not exist'
                        });
                    } else if (response.includes('421') || response.includes('450') || response.includes('451')) {
                        resolve({
                            email,
                            status: 'unknown',
                            reason: 'Temporary error'
                        });
                    } else {
                        resolve({
                            email,
                            status: 'unknown',
                            reason: `Unexpected response: ${response.substring(0, 50)}`
                        });
                    }
                }
            });

            socket.on('error', (err) => {
                clearTimeout(timeout);
                resolve({
                    email,
                    status: 'error',
                    reason: err.message
                });
            });

            socket.on('timeout', () => {
                clearTimeout(timeout);
                socket.destroy();
                resolve({
                    email,
                    status: 'unknown',
                    reason: 'Connection timeout'
                });
            });
        });

    } catch (error) {
        return {
            email,
            status: 'error',
            reason: error.message
        };
    }
}

/**
 * Main verification function
 */
async function verifyEmails() {
    console.log('\n🔍 SMTP Email Verification\n');
    console.log('='.repeat(70));

    // VPN check
    await checkVPN();

    // Read Excel
    console.log('📂 Reading Excel file...\n');
    const workbook = XLSX.readFile(EXCEL_FILE);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);

    // Filter emails to verify
    const toVerify = data.filter(r =>
        r.email &&
        r.validation_status === 'valid' &&
        (!r.smtp_checked || r.smtp_checked === '') // Only check unchecked emails
    ).slice(0, BATCH_SIZE);

    console.log(`📊 Total records: ${data.length}`);
    console.log(`✅ Already checked: ${data.filter(r => r.smtp_checked === 'yes').length}`);
    console.log(`📧 To verify this batch: ${toVerify.length} (max ${BATCH_SIZE})\n`);

    if (toVerify.length === 0) {
        console.log('✅ No emails to verify!\n');
        console.log('All emails have been checked.\n');
        return;
    }

    console.log('⚠️  Starting verification...');
    console.log('⚠️  This will take ~10-15 minutes for 50 emails\n');
    console.log('='.repeat(70) + '\n');

    const results = {
        valid: 0,
        invalid: 0,
        unknown: 0,
        skipped: 0,
        error: 0
    };

    // Verify each email
    for (let i = 0; i < toVerify.length; i++) {
        const record = toVerify[i];
        console.log(`[${i + 1}/${toVerify.length}] Checking: ${record.email}`);

        const result = await verifySMTP(record.email);

        // Update record with results
        record.smtp_status = result.status;
        record.smtp_reason = result.reason;
        record.smtp_checked = 'yes'; // Mark as checked
        record.smtp_check_date = new Date().toISOString().split('T')[0]; // Add date

        // Update stats
        results[result.status]++;

        // Display result
        const icon = result.status === 'valid' ? '✅' :
            result.status === 'invalid' ? '❌' :
                result.status === 'skipped' ? '⏭️' : '⚠️';
        console.log(`   ${icon} ${result.status}: ${result.reason}`);
        console.log(`   ✓ Marked as checked`);

        // Random delay before next check
        if (i < toVerify.length - 1) {
            const delay = Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY + 1)) + MIN_DELAY;
            console.log(`   ⏳ Waiting ${(delay / 1000).toFixed(1)}s...\n`);
            await randomDelay();
        }
    }

    // Save results
    console.log('\n' + '='.repeat(70));
    console.log('\n💾 Saving results...\n');

    const newWorkbook = XLSX.utils.book_new();
    const newWorksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Sheet1');
    XLSX.writeFile(newWorkbook, EXCEL_FILE);

    console.log('✅ Results saved to Excel\n');
    console.log('='.repeat(70));
    console.log('\n📊 SUMMARY:\n');
    console.log(`   Verified: ${toVerify.length}`);
    console.log(`   ✅ Valid: ${results.valid}`);
    console.log(`   ❌ Invalid: ${results.invalid}`);
    console.log(`   ⚠️  Unknown: ${results.unknown}`);
    console.log(`   ⏭️  Skipped: ${results.skipped}`);
    console.log(`   ❌ Errors: ${results.error}`);
    console.log('\n' + '='.repeat(70));
    console.log('\n💡 Next Steps:\n');
    console.log('   1. Review results in emails_data.xlsx');
    console.log('   2. Wait 1 hour before next batch');
    console.log('   3. Consider changing VPN server');
    console.log('   4. Run again to verify more emails\n');
}

// Run verification
verifyEmails().catch(error => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
});
