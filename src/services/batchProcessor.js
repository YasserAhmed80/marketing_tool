import excelService from './excelService.js';
import emailValidator from './emailValidator.js';
import emailSender from './emailSender.js';

/**
 * Batch Processor - Orchestrates the batch email sending process
 */
class BatchProcessor {
    /**
     * Process a batch of emails from Excel file
     * @param {string} filePath - Path to Excel file
     * @param {number} batchSize - Maximum number of emails to send
     * @returns {Object} Batch statistics
     */
    async processBatch(filePath, batchSize = 500) {
        console.log('\n========================================');
        console.log('Starting Batch Email Processing');
        console.log('========================================\n');

        const stats = {
            attempted: 0,
            success: 0,
            failed: 0,
            skipped: 0,
            errors: []
        };

        try {
            // Step 1: Read Excel file
            console.log('Step 1: Reading Excel file...');
            const allData = excelService.readExcelFile(filePath);

            // Initialize email_count field if needed
            excelService.initializeEmailCount(allData);

            // Step 2: Filter records with empty status
            console.log('\nStep 2: Filtering records...');
            const emptyStatusRecords = excelService.filterEmptyStatus(allData);

            if (emptyStatusRecords.length === 0) {
                console.log('\n⚠ No records with empty status found. Nothing to process.');
                return stats;
            }

            // Step 3: Select first N records (batch size)
            const recordsToProcess = emptyStatusRecords.slice(0, batchSize);
            console.log(`✓ Selected ${recordsToProcess.length} records for processing (batch size: ${batchSize})\n`);

            // Step 4: Process each record
            console.log('Step 3: Processing records...\n');

            for (let i = 0; i < recordsToProcess.length; i++) {
                const record = recordsToProcess[i];
                const recordNum = i + 1;

                console.log(`[${recordNum}/${recordsToProcess.length}] Processing: ${record.name} <${record.email}>`);

                stats.attempted++;

                // Validate record
                const validation = emailValidator.validate(record);

                if (!validation.isValid) {
                    // Mark as failed due to validation
                    console.log(`  ✗ Validation failed: ${validation.reason}`);

                    const today = new Date().toISOString().split('T')[0];
                    excelService.updateRecord(allData, record, {
                        status: 'failed',
                        reason: validation.reason,
                        sent_date: today
                    });

                    stats.failed++;
                    stats.errors.push({
                        record: `${record.name} <${record.email}>`,
                        reason: validation.reason
                    });

                    continue;
                }

                // Send email
                const result = await emailSender.sendEmail(record);

                if (result.success) {
                    // Update as success
                    console.log(`  ✓ Email sent successfully (ID: ${result.messageId})`);

                    const currentCount = record.email_count || 0;
                    const today = new Date().toISOString().split('T')[0];
                    excelService.updateRecord(allData, record, {
                        status: 'success',
                        email_count: currentCount + 1,
                        reason: '',
                        sent_date: today
                    });

                    stats.success++;
                } else {
                    // Update as failed
                    console.log(`  ✗ Failed to send: ${result.error}`);

                    const today = new Date().toISOString().split('T')[0];
                    excelService.updateRecord(allData, record, {
                        status: 'failed',
                        reason: result.error,
                        sent_date: today
                    });

                    stats.failed++;
                    stats.errors.push({
                        record: `${record.name} <${record.email}>`,
                        reason: result.error
                    });
                }

                // Delay between emails to avoid rate limiting (2 seconds)
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            // Step 5: Save updated Excel file
            console.log('\nStep 4: Saving updates to Excel file...');
            excelService.saveExcelFile(filePath, allData);

            console.log('\n========================================');
            console.log('Batch Processing Complete');
            console.log('========================================\n');

            return stats;

        } catch (error) {
            console.error('\n✗ Error during batch processing:', error.message);
            throw error;
        }
    }

    /**
     * Display batch statistics
     * @param {Object} stats - Batch statistics
     */
    displayStats(stats) {
        console.log('📊 Batch Statistics:');
        console.log('─────────────────────────────────────');
        console.log(`Total Attempted:  ${stats.attempted}`);
        console.log(`✓ Successful:     ${stats.success}`);
        console.log(`✗ Failed:         ${stats.failed}`);
        console.log('─────────────────────────────────────');

        if (stats.errors.length > 0) {
            console.log('\n❌ Errors:');
            stats.errors.forEach((error, index) => {
                console.log(`  ${index + 1}. ${error.record}`);
                console.log(`     Reason: ${error.reason}`);
            });
        }

        console.log('');
    }
}

export default new BatchProcessor();
