import emailValidator from './src/services/emailValidator.js';

const bouncedEmails = [
    'john.doe@example.com',
    'jane.smith@example.com',
    'tarradco_intl@link.net',
    'agyad@yahoo.com',
    'mas@soficom.com.eg',
    'delta@deltasharm.com',
    'moh@masri.alexnet.com',
    'ihabghaly@dataxprs.com.eg',
    'alexinteriors@yahoo.com',
    'acg@alexcomm.net',
    'kadousus@yahoo.com',
    'mohamadiagroup@hotmail.com',
    'elwakil@cns-egypt.com',
    'amalfarouk@lotusgroup.com',
    'alammaralex@hotmail.com',
    'ramico@ramico.com.eg',
    'nascom@starnet.com.eg',
    'yathreb_cons@hotmail.com',
    'guezira@starnet.com.eg',
    'mohamedsalamaco20@hotmail.com',
    'fieldco@intouch.com',
    'montasser@infinity.com.eg',
    'elmahmoudia@elmahmoudia.com',
    'cccegypt@ccc.com.eg',
    'amr_ts@link.net',
    'techno22@techmechanic.com',
    'solco@soficom.com.eg',
    'egicat@starnet.com.eg',
    'moderncontracting@seoudi.com',
    'remco-acc@yahoo.com',
    'oboor@link.net',
    'metco@internetegypt.com',
    'eccgroup@intouch.com',
    'main@travco-eg.com',
    'econtra@brainy1.ie-eg.com'
];

console.log('\n🔍 Analyzing Bounced Emails\n');
console.log('='.repeat(70));

async function analyzeEmails() {
    const results = {
        testDomains: [],
        noMX: [],
        oldDomains: [],
        valid: [],
        other: []
    };

    for (const email of bouncedEmails) {
        const record = { email, name: 'Test' };
        const validation = await emailValidator.validateDeep(record);

        const domain = email.split('@')[1];

        if (domain === 'example.com') {
            results.testDomains.push({ email, reason: 'Test/example domain (not real)' });
        } else if (!validation.isValid && validation.reason.includes('no mail server')) {
            results.noMX.push({ email, reason: validation.reason, domain });
        } else if (!validation.isValid) {
            results.other.push({ email, reason: validation.reason, domain });
        } else {
            results.valid.push({ email, mxRecords: validation.mxRecords, domain });
        }

        // Small delay
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Display results
    console.log('\n📊 ANALYSIS RESULTS:\n');

    if (results.testDomains.length > 0) {
        console.log(`\n❌ TEST/EXAMPLE DOMAINS (${results.testDomains.length}):`);
        console.log('   These are not real email addresses\n');
        results.testDomains.forEach(r => {
            console.log(`   • ${r.email}`);
        });
    }

    if (results.noMX.length > 0) {
        console.log(`\n❌ NO MAIL SERVER (${results.noMX.length}):`);
        console.log('   Domain has no MX records - cannot receive email\n');
        results.noMX.forEach(r => {
            console.log(`   • ${r.email}`);
            console.log(`     Domain: ${r.domain}`);
        });
    }

    if (results.oldDomains.length > 0) {
        console.log(`\n⚠️  OLD/INACTIVE DOMAINS (${results.oldDomains.length}):\n`);
        results.oldDomains.forEach(r => {
            console.log(`   • ${r.email}`);
        });
    }

    if (results.valid.length > 0) {
        console.log(`\n✅ VALID (has MX records) (${results.valid.length}):`);
        console.log('   These CAN receive email (but mailbox might not exist)\n');
        results.valid.forEach(r => {
            console.log(`   • ${r.email}`);
            console.log(`     MX records: ${r.mxRecords}`);
        });
    }

    if (results.other.length > 0) {
        console.log(`\n⚠️  OTHER ISSUES (${results.other.length}):\n`);
        results.other.forEach(r => {
            console.log(`   • ${r.email}`);
            console.log(`     Reason: ${r.reason}`);
        });
    }

    console.log('\n' + '='.repeat(70));
    console.log('\n📋 SUMMARY:\n');
    console.log(`   Total analyzed: ${bouncedEmails.length}`);
    console.log(`   Test domains: ${results.testDomains.length}`);
    console.log(`   No MX records: ${results.noMX.length}`);
    console.log(`   Valid (has MX): ${results.valid.length}`);
    console.log(`   Other issues: ${results.other.length}`);

    console.log('\n💡 CONCLUSION:\n');

    const invalidCount = results.testDomains.length + results.noMX.length + results.other.length;

    if (invalidCount > 0) {
        console.log(`   ${invalidCount} emails are DEFINITELY invalid (domain issues)`);
    }

    if (results.valid.length > 0) {
        console.log(`   ${results.valid.length} emails have valid domains BUT:`);
        console.log(`   - The specific mailbox might not exist`);
        console.log(`   - The mailbox might be disabled/suspended`);
        console.log(`   - This requires SMTP verification (paid service)`);
    }

    console.log('\n' + '='.repeat(70) + '\n');
}

analyzeEmails().catch(console.error);
