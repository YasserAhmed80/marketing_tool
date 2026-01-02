import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import excelService from './services/excelService.js';
import emailValidator from './services/emailValidator.js';
import emailSender from './services/emailSender.js';
import batchProcessor from './services/batchProcessor.js';
import dailySendLimiter from './services/dailySendLimiter.js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to validate emails (basic - fast)
app.post('/api/validate', async (req, res) => {
    try {
        const filePath = path.join(process.cwd(), 'emails_data.xlsx');

        // Read Excel file
        const allData = excelService.readExcelFile(filePath);

        let validCount = 0;
        let invalidCount = 0;

        // Validate each record and add validation_status column
        allData.forEach(record => {
            const validation = emailValidator.validate(record);

            if (validation.isValid) {
                record.validation_status = 'valid';
                validCount++;
            } else {
                record.validation_status = 'invalid';
                record.validation_reason = validation.reason;
                invalidCount++;
            }
        });

        // Save updated Excel file
        excelService.saveExcelFile(filePath, allData);

        res.json({
            success: true,
            message: 'Email validation completed',
            stats: {
                total: allData.length,
                valid: validCount,
                invalid: invalidCount
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// NEW: API endpoint for DEEP validation (checks MX records - prevents bounces!)
app.post('/api/validate-deep', async (req, res) => {
    try {
        const filePath = path.join(process.cwd(), 'emails_data.xlsx');

        // Read Excel file
        const allData = excelService.readExcelFile(filePath);

        let validCount = 0;
        let invalidCount = 0;
        let processed = 0;

        console.log(`\n🔍 Starting deep validation for ${allData.length} emails...`);

        // Validate each record with MX verification
        for (const record of allData) {
            const validation = await emailValidator.validateDeep(record);

            processed++;
            console.log(`[${processed}/${allData.length}] ${record.email} - ${validation.isValid ? '✓ Valid' : '✗ Invalid'}`);

            if (validation.isValid) {
                record.validation_status = 'valid';
                record.validation_reason = `MX records found: ${validation.mxRecords}`;
                validCount++;
            } else {
                record.validation_status = 'invalid';
                record.validation_reason = validation.reason;
                invalidCount++;
            }

            // Small delay to avoid overwhelming DNS servers
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Save updated Excel file
        excelService.saveExcelFile(filePath, allData);

        console.log(`\n✅ Deep validation completed!`);
        console.log(`   Valid: ${validCount} | Invalid: ${invalidCount}\n`);

        res.json({
            success: true,
            message: 'Deep email validation completed (MX records verified)',
            stats: {
                total: allData.length,
                valid: validCount,
                invalid: invalidCount
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// API endpoint to send emails
app.post('/api/send', async (req, res) => {
    try {
        const filePath = path.join(process.cwd(), 'emails_verified_to_send.xlsx');
        const batchSize = 100; // Send 100 emails per day

        // Check daily limit BEFORE sending
        const limitCheck = dailySendLimiter.canSend(batchSize);

        if (!limitCheck.allowed) {
            return res.status(429).json({
                success: false,
                message: limitCheck.message,
                stats: {
                    sent: limitCheck.sent,
                    remaining: limitCheck.remaining,
                    limit: 100
                }
            });
        }

        console.log(`\n✅ Daily limit check passed: ${limitCheck.message}\n`);

        // Initialize email sender
        emailSender.initialize(
            process.env.RESEND_API_KEY,
            process.env.SENDER_EMAIL,
            process.env.EMAIL_SUBJECT
        );

        // Process batch
        const stats = await batchProcessor.processBatch(filePath, batchSize);

        // Record sent emails in daily tracker
        dailySendLimiter.recordSent(stats.success);

        // Get updated status
        const status = dailySendLimiter.getStatus();

        res.json({
            success: true,
            message: `Email sending completed - sent ${stats.success} emails. Daily total: ${status.sent}/100`,
            stats: stats,
            dailyStatus: status
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// API endpoint to get current stats
app.get('/api/stats', async (req, res) => {
    try {
        const filePath = path.join(process.cwd(), 'emails_verified_to_send.xlsx');
        const allData = excelService.readExcelFile(filePath);

        const stats = {
            total: allData.length,
            valid: allData.filter(r => r.validation_status === 'valid').length,
            invalid: allData.filter(r => r.validation_status === 'invalid').length,
            sent: allData.filter(r => r.status === 'success').length,
            failed: allData.filter(r => r.status === 'failed').length,
            pending: allData.filter(r => !r.status || r.status === '').length
        };

        res.json({
            success: true,
            stats: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 Email Management System`);
    console.log(`📊 Dashboard: http://localhost:3000`);
    console.log(`\nPress Ctrl+C to stop\n`);
});
