import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Email Sender Service - Handles sending emails via Resend API
 */
class EmailSender {
    constructor() {
        this.resend = null;
        this.senderEmail = null;
        this.emailSubject = null;
        this.emailTemplate = null;
    }

    /**
     * Initialize the email sender with configuration
     * @param {string} apiKey - Resend API key
     * @param {string} senderEmail - Sender email address
     * @param {string} emailSubject - Email subject line
     */
    initialize(apiKey, senderEmail, emailSubject) {
        if (!apiKey) {
            throw new Error('Resend API key is required');
        }
        if (!senderEmail) {
            throw new Error('Sender email is required');
        }
        if (!emailSubject) {
            throw new Error('Email subject is required');
        }

        this.resend = new Resend(apiKey);
        this.senderEmail = senderEmail;
        this.emailSubject = emailSubject;

        // Load email template
        const templatePath = path.join(__dirname, '../templates/emailTemplate.html');
        this.emailTemplate = fs.readFileSync(templatePath, 'utf-8');

        console.log('✓ Email sender initialized successfully');
    }

    /**
     * Personalize email template with recipient name
     * @param {string} name - Recipient name
     * @returns {string} Personalized HTML content
     */
    personalizeTemplate(name) {
        // Handle empty, null, or "none" names
        let displayName = name;

        if (!name ||
            name.toString().trim() === '' ||
            name.toString().toLowerCase() === 'none' ||
            name.toString().toLowerCase() === 'null' ||
            name.toString().toLowerCase() === 'n/a') {
            displayName = 'السيد/السيدة'; // Generic Arabic greeting (Mr./Mrs.)
        } else {
            displayName = name.toString().trim();
        }

        return this.emailTemplate.replace(/<name>/g, displayName);
    }

    /**
     * Send email to a recipient
     * @param {Object} record - Recipient record
     * @returns {Object} Result { success: boolean, error: string }
     */
    async sendEmail(record) {
        try {
            const personalizedHtml = this.personalizeTemplate(record.name);

            const result = await this.resend.emails.send({
                from: this.senderEmail,
                to: record.email,
                subject: this.emailSubject,
                html: personalizedHtml
            });

            // Check if send was successful
            if (result.error) {
                return {
                    success: false,
                    error: result.error.message || 'Unknown error from Resend API'
                };
            }

            return {
                success: true,
                error: null,
                messageId: result.data?.id
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Failed to send email'
            };
        }
    }
}

export default new EmailSender();
