import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import emailSender from './services/emailSender.js';
import batchProcessor from './services/batchProcessor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

/**
 * Main application entry point
 */
async function main() {
    try {
        console.log('\n🚀 Batch Email Sender\n');

        // Get Excel file path from command line arguments
        const excelFilePath = process.argv[2];

        if (!excelFilePath) {
            console.error('❌ Error: Excel file path is required');
            console.log('\nUsage: node src/index.js <path-to-excel-file>');
            console.log('Example: node src/index.js sample_data.xlsx\n');
            process.exit(1);
        }

        // Resolve absolute path
        const absolutePath = path.resolve(excelFilePath);

        // Validate environment variables
        const apiKey = process.env.RESEND_API_KEY;
        const senderEmail = process.env.SENDER_EMAIL;
        const emailSubject = process.env.EMAIL_SUBJECT;
        const batchSize = parseInt(process.env.BATCH_SIZE || '500');

        if (!apiKey) {
            console.error('❌ Error: RESEND_API_KEY not found in .env file');
            console.log('Please create a .env file based on .env.example\n');
            process.exit(1);
        }

        if (!senderEmail) {
            console.error('❌ Error: SENDER_EMAIL not found in .env file');
            console.log('Please create a .env file based on .env.example\n');
            process.exit(1);
        }

        if (!emailSubject) {
            console.error('❌ Error: EMAIL_SUBJECT not found in .env file');
            console.log('Please create a .env file based on .env.example\n');
            process.exit(1);
        }

        // Initialize email sender
        emailSender.initialize(apiKey, senderEmail, emailSubject);

        // Process batch
        const stats = await batchProcessor.processBatch(absolutePath, batchSize);

        // Display results
        batchProcessor.displayStats(stats);

        // Exit with appropriate code
        if (stats.failed > 0) {
            console.log('⚠ Batch completed with some failures\n');
            process.exit(0);
        } else {
            console.log('✅ Batch completed successfully\n');
            process.exit(0);
        }

    } catch (error) {
        console.error('\n❌ Fatal Error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run the application
main();
