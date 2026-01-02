import fetch from 'node-fetch';
import XLSX from 'xlsx';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.ZEROBOUNCE_API_KEY;
const EXCEL_FILE = 'emails_data.xlsx';
const BATCH_SIZE = 9; // Verify 9 at a time (remaining credits)
const DELAY = 500; // 0.5 second between requests

/**
 * Check ZeroBounce credits
 */
async function checkCredits() {
    try {
        const response = await fetch(`https://api.zerobounce.net/v2/getcredits?api_key=${API_KEY}`);
        const data = await response.json();
        return data.Credits || 0;
    } catch (error) {
        console.error('Error checking credits:', error.message);
        return 0;
    }
}

/**
 * Verify single email with ZeroBounce
 */
async function verifyEmail(email) {
    try {
        const url = `https://api.zerobounce.net/v2/validate?api_key=${API_KEY}&email=${encodeURIComponent(email)}`;
        const response = await fetch(url);
        const data = await response.json();

        return {
            email: email,
            status: data.status,
            sub_status: data.sub_status,
            account: data.account,
            domain: data.domain,
            did_you_mean: data.did_you_mean,
            free_email: data.free_email,
            mx_found: data.mx_found,
            mx_record: data.mx_record,
            smtp_provider: data.smtp_provider
        };
    } catch (error) {
        return {
            email: email,
            status: 'error',
            error: error.message
        };
    }
}

/**
 * Main verification function
 */
async function verifyWithZeroBounce() {
    console.log('\n🔍 ZeroBounce Email Verification\n');
    console.log('='.repeat(70));

    // Check credits first
    console.log('\n💳 Checking credits...\n');
    const credits = await checkCredits();
    console.log(`✅ Available credits: ${credits}\n`);

    if (credits === 0) {
        console.log('❌ No credits available!\n');
        return;
    }

    // Read Excel
    console.log('📂 Reading Excel file...\n');
    const workbook = XLSX.readFile(EXCEL_FILE);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);

    // Filter emails to verify (emails that haven't been checked by ZeroBounce yet)
    const toVerify = data.filter(r =>
        r.email &&
        (!r.zerobounce_status || r.zerobounce_status === '')
    ).slice(0, Math.min(BATCH_SIZE, credits));

    console.log(`📊 Total records: ${data.length}`);
    console.log(`✅ Already verified: ${data.filter(r => r.zerobounce_status).length}`);
    console.log(`📧 To verify this batch: ${toVerify.length} (max ${BATCH_SIZE})\n`);

    if (toVerify.length === 0) {
        console.log('✅ No emails to verify!\n');
        console.log('All emails have been verified.\n');
        return;
    }

    console.log('⚠️  Starting verification...');
    console.log('⚠️  This will take ~1 minute per 100 emails\n');
    console.log('='.repeat(70) + '\n');

    const results = {
        valid: 0,
        invalid: 0,
        catch_all: 0,
        unknown: 0,
        spamtrap: 0,
        abuse: 0,
        do_not_mail: 0,
        error: 0
    };

    // Verify each email
    for (let i = 0; i < toVerify.length; i++) {
        const record = toVerify[i];
        console.log(`[${i + 1}/${toVerify.length}] Verifying: ${record.email}`);

        const result = await verifyEmail(record.email);

        // Update record
        record.zerobounce_status = result.status;
        record.zerobounce_sub_status = result.sub_status || '';
        record.zerobounce_checked = 'yes';
        record.zerobounce_check_date = new Date().toISOString().split('T')[0];
        record.zerobounce_free_email = result.free_email ? 'yes' : 'no';
        record.zerobounce_did_you_mean = result.did_you_mean || '';

        // Update stats
        const status = result.status.toLowerCase().replace('-', '_');
        if (results[status] !== undefined) {
            results[status]++;
        }

        // Display result
        let icon = '❓';
        let color = '';

        switch (result.status) {
            case 'valid':
                icon = '✅';
                color = 'Valid - Safe to send';
                break;
            case 'invalid':
                icon = '❌';
                color = 'Invalid - Do not send';
                break;
            case 'catch-all':
                icon = '⚠️';
                color = 'Catch-all - Risky';
                break;
            case 'spamtrap':
                icon = '🚨';
                color = 'SPAM TRAP - DO NOT SEND!';
                break;
            case 'abuse':
                icon = '⚠️';
                color = 'Abuse - Do not send';
                break;
            case 'do_not_mail':
                icon = '🚫';
                color = 'Do not mail';
                break;
            case 'unknown':
                icon = '❓';
                color = 'Unknown - Cannot verify';
                break;
            default:
                icon = '❌';
                color = 'Error';
        }

        console.log(`   ${icon} ${result.status}: ${color}`);
        if (result.sub_status) {
            console.log(`      Sub-status: ${result.sub_status}`);
        }
        if (result.did_you_mean) {
            console.log(`      💡 Did you mean: ${result.did_you_mean}`);
        }
        console.log(`   ✓ Marked as verified`);

        // SAVE AFTER EACH EMAIL (prevents data loss if interrupted)
        const saveWorkbook = XLSX.utils.book_new();
        const saveWorksheet = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(saveWorkbook, saveWorksheet, 'Sheet1');
        XLSX.writeFile(saveWorkbook, EXCEL_FILE);
        console.log(`   💾 Saved to Excel`);

        // Small delay
        if (i < toVerify.length - 1) {
            await new Promise(resolve => setTimeout(resolve, DELAY));
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
    console.log(`   ✅ Valid: ${results.valid} (safe to send)`);
    console.log(`   ❌ Invalid: ${results.invalid} (do not send)`);
    console.log(`   ⚠️  Catch-all: ${results.catch_all} (risky)`);
    console.log(`   ❓ Unknown: ${results.unknown} (cannot verify)`);
    console.log(`   🚨 Spam traps: ${results.spamtrap} (DO NOT SEND!)`);
    console.log(`   ⚠️  Abuse: ${results.abuse} (do not send)`);
    console.log(`   🚫 Do not mail: ${results.do_not_mail} (do not send)`);
    console.log(`   ❌ Errors: ${results.error}`);

    // Check remaining credits
    const remainingCredits = await checkCredits();
    console.log(`\n💳 Credits used: ${credits - remainingCredits}`);
    console.log(`💳 Credits remaining: ${remainingCredits}`);

    console.log('\n' + '='.repeat(70));
    console.log('\n💡 Next Steps:\n');
    console.log('   1. Review results in emails_data.xlsx');
    console.log('   2. Send only to "valid" emails');
    console.log('   3. DO NOT send to spam traps!');
    console.log('   4. Run again to verify more emails\n');

    // Recommendations
    const totalBad = results.invalid + results.spamtrap + results.abuse + results.do_not_mail;
    const totalGood = results.valid;
    const bounceRate = ((totalBad / toVerify.length) * 100).toFixed(1);

    console.log('📈 ANALYSIS:\n');
    console.log(`   Safe to send: ${totalGood} emails (${((totalGood / toVerify.length) * 100).toFixed(1)}%)`);
    console.log(`   Do not send: ${totalBad} emails (${bounceRate}%)`);
    console.log(`   Estimated bounce rate: ${bounceRate}%\n`);

    if (bounceRate < 5) {
        console.log('   ✅ Excellent! Very low bounce rate.\n');
    } else if (bounceRate < 10) {
        console.log('   ⚠️  Acceptable bounce rate, but could be better.\n');
    } else {
        console.log('   🚨 High bounce rate! Clean your list more.\n');
    }

    console.log('='.repeat(70) + '\n');
}

// Run verification
verifyWithZeroBounce().catch(error => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
});
