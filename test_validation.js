import emailValidator from './src/services/emailValidator.js';

console.log('\n🔍 Testing Enhanced Email Validation\n');
console.log('='.repeat(60));

// Test cases
const testCases = [
    { name: 'John Doe', email: 'john@example.com', expected: 'Valid' },
    { name: 'Jane Smith', email: 'jane.smith@company.com', expected: 'Valid' },
    { name: 'Test User', email: 'test@tempmail.com', expected: 'Disposable' },
    { name: 'Admin', email: 'admin@company.com', expected: 'Role-based' },
    { name: 'Support', email: 'support@company.com', expected: 'Role-based' },
    { name: 'Test', email: 'test123@example.com', expected: 'Spam trap' },
    { name: 'User', email: 'noreply@example.com', expected: 'Spam trap' },
    { name: 'Bad Email', email: 'invalid-email', expected: 'Invalid format' },
    { name: '', email: 'test@example.com', expected: 'Empty name' },
    { name: 'User', email: '', expected: 'Empty email' },
];

testCases.forEach((testCase, index) => {
    const result = emailValidator.validate(testCase);
    const status = result.isValid ? '✅ VALID' : '❌ INVALID';

    console.log(`\n${index + 1}. ${testCase.name} <${testCase.email}>`);
    console.log(`   Expected: ${testCase.expected}`);
    console.log(`   Result: ${status}`);
    if (!result.isValid) {
        console.log(`   Reason: ${result.reason}`);
    }
});

console.log('\n' + '='.repeat(60));
console.log('\n✅ Enhanced validation testing complete!\n');
