import fs from 'fs';
import path from 'path';

const LIMIT_FILE = 'daily_send_limit.json';

/**
 * Daily Send Limit Tracker
 * Prevents sending more than 100 emails per day
 */
class DailySendLimiter {
    constructor() {
        this.dailyLimit = 100;
        this.limitFilePath = path.join(process.cwd(), LIMIT_FILE);
    }

    /**
     * Get today's date in YYYY-MM-DD format
     */
    getTodayDate() {
        const now = new Date();
        return now.toISOString().split('T')[0];
    }

    /**
     * Load send data from file
     */
    loadData() {
        try {
            if (fs.existsSync(this.limitFilePath)) {
                const data = fs.readFileSync(this.limitFilePath, 'utf-8');
                return JSON.parse(data);
            }
        } catch (error) {
            console.error('Error loading limit data:', error.message);
        }
        return { date: this.getTodayDate(), sent: 0 };
    }

    /**
     * Save send data to file
     */
    saveData(data) {
        try {
            fs.writeFileSync(this.limitFilePath, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Error saving limit data:', error.message);
        }
    }

    /**
     * Check if we can send more emails today
     * @param {number} count - Number of emails to send
     * @param {number} [customLimit] - Optional custom limit for this check
     * @returns {Object} { allowed: boolean, remaining: number, message: string }
     */
    canSend(count, customLimit) {
        const data = this.loadData();
        const today = this.getTodayDate();

        // Use custom limit if provided, otherwise default
        const limit = customLimit || this.dailyLimit;

        // Reset counter if it's a new day
        if (data.date !== today) {
            data.date = today;
            data.sent = 0;
            this.saveData(data);
        }

        const remaining = limit - data.sent;

        if (remaining <= 0) {
            return {
                allowed: false,
                remaining: 0,
                sent: data.sent,
                message: `Daily limit reached! Already sent ${data.sent} emails today. Limit is ${limit}.`
            };
        }

        if (count > remaining) {
            return {
                allowed: false,
                remaining: remaining,
                sent: data.sent,
                message: `Cannot send ${count} emails. Only ${remaining} remaining today (already sent ${data.sent}, limit ${limit}).`
            };
        }

        return {
            allowed: true,
            remaining: remaining,
            sent: data.sent,
            message: `OK to send ${count} emails. ${remaining - count} will remain after this batch.`
        };
    }

    /**
     * Record that emails were sent
     * @param {number} count - Number of emails sent
     */
    recordSent(count) {
        const data = this.loadData();
        const today = this.getTodayDate();

        // Reset if new day
        if (data.date !== today) {
            data.date = today;
            data.sent = 0;
        }

        data.sent += count;
        this.saveData(data);

        console.log(`📊 Daily send tracker: ${data.sent}/${this.dailyLimit} emails sent today`);
    }

    /**
     * Get current status
     */
    getStatus() {
        const data = this.loadData();
        const today = this.getTodayDate();

        if (data.date !== today) {
            return {
                date: today,
                sent: 0,
                remaining: this.dailyLimit,
                limit: this.dailyLimit
            };
        }

        return {
            date: data.date,
            sent: data.sent,
            remaining: this.dailyLimit - data.sent,
            limit: this.dailyLimit
        };
    }

    /**
     * Reset counter (for testing or manual reset)
     */
    reset() {
        const data = {
            date: this.getTodayDate(),
            sent: 0
        };
        this.saveData(data);
        console.log('✅ Daily send counter reset');
    }
}

export default new DailySendLimiter();
