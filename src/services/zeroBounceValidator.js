import fetch from 'node-fetch';

/**
 * ZeroBounce Email Verification Service
 * Verifies if individual mailboxes actually exist
 */
class ZeroBounceValidator {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.zerobounce.net/v2';
    }

    /**
     * Verify a single email address
     * @param {string} email - Email to verify
     * @returns {Object} Verification result
     */
    async verifyEmail(email) {
        try {
            const url = `${this.baseUrl}/validate?api_key=${this.apiKey}&email=${encodeURIComponent(email)}`;

            const response = await fetch(url);
            const data = await response.json();

            // ZeroBounce status values:
            // valid - Email exists and is safe to send
            // invalid - Email doesn't exist or is invalid
            // catch-all - Domain accepts all emails (risky)
            // unknown - Cannot determine (server doesn't allow verification)
            // spamtrap - Known spam trap
            // abuse - Known complainer
            // do_not_mail - Should not send to this email

            return {
                email: email,
                status: data.status,
                subStatus: data.sub_status,
                isValid: data.status === 'valid',
                isCatchAll: data.status === 'catch-all',
                isDisposable: data.disposable || false,
                didYouMean: data.did_you_mean || null,
                reason: this.getReasonText(data)
            };
        } catch (error) {
            return {
                email: email,
                status: 'error',
                isValid: false,
                reason: `Verification error: ${error.message}`
            };
        }
    }

    /**
     * Get human-readable reason
     */
    getReasonText(data) {
        switch (data.status) {
            case 'valid':
                return 'Email verified - mailbox exists';
            case 'invalid':
                return `Invalid: ${data.sub_status || 'mailbox not found'}`;
            case 'catch-all':
                return 'Catch-all domain (cannot verify specific mailbox)';
            case 'unknown':
                return 'Cannot verify (server blocks verification)';
            case 'spamtrap':
                return 'Spam trap detected';
            case 'abuse':
                return 'Known complainer';
            case 'do_not_mail':
                return 'Do not mail';
            default:
                return data.sub_status || 'Unknown status';
        }
    }

    /**
     * Get account credits
     */
    async getCredits() {
        try {
            const url = `${this.baseUrl}/getcredits?api_key=${this.apiKey}`;
            const response = await fetch(url);
            const data = await response.json();
            return data.Credits || 0;
        } catch (error) {
            return 0;
        }
    }
}

export default ZeroBounceValidator;
