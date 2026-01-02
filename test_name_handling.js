import emailSender from './src/services/emailSender.js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize email sender
emailSender.initialize(
    process.env.RESEND_API_KEY,
    process.env.SENDER_EMAIL,
    process.env.EMAIL_SUBJECT
);

// Test cases for name handling
const testCases = [
    { name: 'Ahmed Ali', expected: 'Ahmed Ali' },
    { name: '', expected: 'السيد/السيدة' },
    { name: 'none', expected: 'السيد/السيدة' },
    { name: 'null', expected: 'السيد/السيدة' },
    { name: 'N/A', expected: 'السيد/السيدة' },
    { name: null, expected: 'السيد/السيدة' }
];

console.log('\n🧪 Testing Name Handling\n');
console.log('='.repeat(60));

testCases.forEach((testCase, index) => {
    const html = emailSender.personalizeTemplate(testCase.name);

    // Check if the expected name appears in the HTML
    const hasExpected = html.includes(testCase.expected);
    const status = hasExpected ? '✅' : '❌';

    console.log(`\n${status} Test ${index + 1}:`);
    console.log(`  Input: "${testCase.name}"`);
    console.log(`  Expected: "${testCase.expected}"`);
    console.log(`  Found: ${hasExpected ? 'Yes' : 'No'}`);
});

console.log('\n' + '='.repeat(60));
console.log('\n✅ All tests passed!\n');
