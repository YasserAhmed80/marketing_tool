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

// API endpoint to start scraping
app.post('/api/scrape', async (req, res) => {
    try {
        const { country, maxResults, delay } = req.body;

        if (!country) {
            return res.status(400).json({
                success: false,
                message: 'Country is required'
            });
        }

        console.log(`\n🔍 Starting scraper for ${country}...`);
        console.log(`   Max Results: ${maxResults}`);
        console.log(`   Delay: ${delay}ms\n`);

        // Import child_process
        const { spawn } = await import('child_process');

        // Spawn scraper process
        const scraperPath = path.join(process.cwd(), 'scraper', 'deep_scraper.js');
        const scraper = spawn('node', [scraperPath], {
            env: {
                ...process.env,
                SCRAPER_COUNTRY: country,
                SCRAPER_LIMIT: maxResults.toString(),
                SCRAPER_AUTO: 'true'
            },
            cwd: process.cwd(),
            shell: true
        });

        // Send immediate response
        res.json({
            success: true,
            message: `Scraping started for ${country}! A browser window will open. Check terminal for progress.`,
            stats: { total: 0, withPhone: 0, withEmail: 0 }
        });

        // Log output
        scraper.stdout.on('data', (data) => console.log(data.toString()));
        scraper.stderr.on('data', (data) => console.error('Scraper:', data.toString()));
        scraper.on('close', (code) => console.log(`\n✅ Scraper finished (code: ${code})\n`));

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// API endpoint to get scraper stats
app.get('/api/scraper-stats', async (req, res) => {
    try {
        // Check both possible locations
        let filePath = path.join(process.cwd(), 'real_estate_leads.xlsx');
        const fs = await import('fs');

        if (!fs.default.existsSync(filePath)) {
            filePath = path.join(process.cwd(), 'scraper', 'real_estate_leads.xlsx');
        }

        let stats = {
            total: 0,
            withPhone: 0,
            withEmail: 0
        };

        let latestResults = [];

        try {
            const data = excelService.readExcelFile(filePath);
            stats.total = data.length;
            stats.withPhone = data.filter(r => r.phone && r.phone !== '').length;
            stats.withEmail = data.filter(r => r.email && r.email !== '').length;

            // Get latest 10 results
            latestResults = data.slice(-10);
        } catch (e) {
            // File doesn't exist yet
        }

        res.json({
            success: true,
            stats: stats,
            latestResults: latestResults
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
