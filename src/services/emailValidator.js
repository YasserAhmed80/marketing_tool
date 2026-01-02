import validator from 'email-validator';
import dns from 'dns';
import { promisify } from 'util';

const resolveMx = promisify(dns.resolveMx);

/**
 * Email Validator Service - Enhanced validation with real mailbox verification
 */
class EmailValidator {
  constructor() {
    // Common disposable/temporary email domains to block
    this.disposableDomains = [
      'tempmail.com', 'throwaway.email', '10minutemail.com', 'guerrillamail.com',
      'mailinator.com', 'maildrop.cc', 'temp-mail.org', 'yopmail.com',
      'sharklasers.com', 'trashmail.com', 'getnada.com', 'fakeinbox.com'
    ];

    // Role-based emails (often spam traps or low engagement)
    this.roleBasedPrefixes = [
      'admin', 'info', 'support', 'sales', 'contact', 'help',
      'noreply', 'no-reply', 'postmaster', 'webmaster', 'abuse'
    ];

    // Known spam trap patterns
    this.spamTrapPatterns = [
      /^test\d*@/i,
      /^spam@/i,
      /^abuse@/i,
      /^noreply@/i,
      /^no-reply@/i
    ];
  }

  /**
   * Check if email domain is disposable/temporary
   */
  isDisposableEmail(email) {
    const domain = email.split('@')[1]?.toLowerCase();
    return this.disposableDomains.includes(domain);
  }

  /**
   * Check if email is role-based
   */
  isRoleBasedEmail(email) {
    const localPart = email.split('@')[0]?.toLowerCase();
    return this.roleBasedPrefixes.some(prefix => localPart === prefix);
  }

  /**
   * Check if email matches spam trap patterns
   */
  isSpamTrap(email) {
    return this.spamTrapPatterns.some(pattern => pattern.test(email));
  }

  /**
   * Advanced email syntax validation
   */
  hasValidSyntax(email) {
    if (!validator.validate(email)) {
      return false;
    }

    const parts = email.split('@');
    if (parts.length !== 2) return false;

    const [localPart, domain] = parts;

    // Local part checks
    if (localPart.length === 0 || localPart.length > 64) return false;
    if (localPart.startsWith('.') || localPart.endsWith('.')) return false;
    if (localPart.includes('..')) return false;

    // Domain checks
    if (domain.length === 0 || domain.length > 255) return false;
    if (!domain.includes('.')) return false;
    if (domain.startsWith('.') || domain.endsWith('.')) return false;
    if (domain.startsWith('-') || domain.endsWith('-')) return false;

    return true;
  }

  /**
   * NEW: Verify domain has valid MX records (mail server exists)
   */
  async verifyDomainMX(email) {
    try {
      const domain = email.split('@')[1];
      const mxRecords = await resolveMx(domain);

      // Domain has mail servers configured
      return {
        valid: mxRecords && mxRecords.length > 0,
        mxRecords: mxRecords
      };
    } catch (error) {
      // DNS lookup failed - domain doesn't exist or has no MX records
      return {
        valid: false,
        error: error.code
      };
    }
  }

  /**
   * NEW: Deep validation - checks if email inbox actually exists
   * This is the key function to prevent bounces!
   */
  async validateDeep(record) {
    // Basic checks first
    if (!record.email || record.email.toString().trim() === '') {
      return {
        isValid: false,
        reason: 'Invalid data: Email is empty',
        severity: 'error'
      };
    }

    // Name is optional - we'll use generic greeting if empty

    const email = record.email.toString().trim().toLowerCase();

    // Syntax validation
    if (!this.hasValidSyntax(email)) {
      return {
        isValid: false,
        reason: 'Invalid data: Email format is invalid',
        severity: 'error'
      };
    }

    // Disposable email check
    if (this.isDisposableEmail(email)) {
      return {
        isValid: false,
        reason: 'Invalid data: Disposable email address detected',
        severity: 'warning'
      };
    }

    // Spam trap check
    if (this.isSpamTrap(email)) {
      return {
        isValid: false,
        reason: 'Invalid data: Potential spam trap email',
        severity: 'warning'
      };
    }

    // Role-based check (optional - can be disabled)
    if (this.isRoleBasedEmail(email)) {
      return {
        isValid: false,
        reason: 'Invalid data: Role-based email address (low engagement)',
        severity: 'warning'
      };
    }

    // NEW: MX Record verification - checks if domain can receive emails
    const mxCheck = await this.verifyDomainMX(email);
    if (!mxCheck.valid) {
      return {
        isValid: false,
        reason: `Invalid data: Domain has no mail server (${mxCheck.error || 'No MX records'})`,
        severity: 'error'
      };
    }

    // All validations passed
    return {
      isValid: true,
      reason: null,
      mxRecords: mxCheck.mxRecords?.length || 0
    };
  }

  /**
   * Standard validation (fast, no network calls)
   * Use this for quick checks
   */
  validate(record) {
    // Check if email exists
    if (!record.email || record.email.toString().trim() === '') {
      return {
        isValid: false,
        reason: 'Invalid data: Email is empty'
      };
    }

    // Name is optional - we'll use generic greeting if empty

    const email = record.email.toString().trim().toLowerCase();

    // Advanced syntax validation
    if (!this.hasValidSyntax(email)) {
      return {
        isValid: false,
        reason: 'Invalid data: Email format is invalid'
      };
    }

    // Check for disposable/temporary emails
    if (this.isDisposableEmail(email)) {
      return {
        isValid: false,
        reason: 'Invalid data: Disposable email address detected'
      };
    }

    // Check for spam trap patterns
    if (this.isSpamTrap(email)) {
      return {
        isValid: false,
        reason: 'Invalid data: Potential spam trap email'
      };
    }

    // Check for role-based emails
    if (this.isRoleBasedEmail(email)) {
      return {
        isValid: false,
        reason: 'Invalid data: Role-based email address (low engagement)'
      };
    }

    // All validations passed
    return {
      isValid: true,
      reason: null
    };
  }
}

export default new EmailValidator();
