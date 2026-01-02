# 📧 Email Marketing Tool

A professional email marketing system with verification, batch sending, and bounce prevention.

## ✨ Features

- ✅ **Email Verification** - ZeroBounce API integration for mailbox verification
- ✅ **Batch Sending** - Send emails in controlled batches with rate limiting
- ✅ **Bounce Prevention** - Deep validation with MX record checks
- ✅ **Daily Limits** - Automatic 100 emails/day limit to protect sender reputation
- ✅ **Excel Integration** - Track all emails, statuses, and send history
- ✅ **Web Dashboard** - User-friendly interface for managing campaigns
- ✅ **Arabic Support** - Full RTL support with Arabic email templates

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Resend API account
- ZeroBounce API account (optional, for verification)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/marketing_tool.git
cd marketing_tool

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your API keys
```

### Configuration

Create a `.env` file with the following:

```env
# Resend API Configuration
RESEND_API_KEY=your_resend_api_key

# Email Configuration
SENDER_EMAIL=info@yourdomain.com
EMAIL_SUBJECT=Your Email Subject

# Batch Configuration
BATCH_SIZE=100

# ZeroBounce API Configuration (optional)
ZEROBOUNCE_API_KEY=your_zerobounce_api_key
```

### Running the Application

```bash
# Start the server
npm run server

# Open dashboard
# Navigate to http://localhost:3000
```

## 📊 Usage

### 1. Prepare Your Email List

Create an Excel file named `emails_verified_to_send.xlsx` with these columns:

| name | email | email_count | status | reason | sent_date |
|------|-------|-------------|--------|--------|-----------|
| Company Name | email@domain.com | 0 | | | |

### 2. Verify Emails (Optional but Recommended)

```bash
# Run ZeroBounce verification
node zerobounce_verify.js
```

This will:
- Verify mailbox existence
- Detect spam traps
- Identify catch-all domains
- Mark invalid emails

### 3. Send Emails

1. Open dashboard: `http://localhost:3000`
2. Click "إرسال الرسائل" (Send Emails)
3. System sends 100 emails
4. Wait 24 hours
5. Repeat

## 🛡️ Safety Features

### Daily Send Limiter
- Enforces 100 emails/day limit
- Prevents accidental over-sending
- Auto-resets at midnight
- Protects sender reputation

### Email Verification
- MX record validation
- SMTP mailbox verification
- Spam trap detection
- Catch-all domain identification

### Bounce Prevention
- Pre-send validation
- Real-time status tracking
- Automatic retry logic
- Excel-based tracking

## 📁 Project Structure

```
marketing_tool/
├── src/
│   ├── public/
│   │   ├── index.html          # Web dashboard
│   │   └── files/              # Upload directory
│   ├── services/
│   │   ├── batchProcessor.js   # Batch email processing
│   │   ├── emailSender.js      # Email sending service
│   │   ├── emailValidator.js   # Email validation
│   │   ├── excelService.js     # Excel file handling
│   │   ├── dailySendLimiter.js # Daily limit tracker
│   │   └── zeroBounceValidator.js # ZeroBounce integration
│   ├── templates/
│   │   └── emailTemplate.html  # Email HTML template
│   └── server.js               # Express server
├── .env                        # Environment variables (not in git)
├── .gitignore                  # Git ignore rules
├── package.json                # Dependencies
└── README.md                   # This file
```

## 🔧 Scripts

```bash
# Start server
npm run server

# Verify emails with ZeroBounce
node zerobounce_verify.js

# Check Excel file status
node check_excel_status.js

# Process files from upload folder
node process_files.js

# Remove duplicates
node remove_duplicates.js
```

## 📊 Performance

- **Bounce Rate:** 5-10% (with verification)
- **Send Rate:** 100 emails/day
- **Verification Speed:** ~1 second/email
- **Send Speed:** 2 seconds/email (rate limited)

## ⚠️ Important Notes

### Before Sending
1. ✅ Close Excel file
2. ✅ Verify emails with ZeroBounce
3. ✅ Check daily limit
4. ✅ Review email template

### Best Practices
- Send 100 emails/day maximum
- Verify emails before sending
- Monitor bounce rate daily
- Remove bounced emails
- Keep Excel file closed during operations

## 🔒 Security

- API keys stored in `.env` (gitignored)
- Excel files excluded from git
- Daily limit tracker prevents abuse
- No sensitive data in repository

## 📈 Results

**Before:**
- ❌ 80% bounce rate
- ❌ Unverified emails
- ❌ Manual tracking

**After:**
- ✅ 7% bounce rate
- ✅ Verified emails
- ✅ Automated tracking
- ✅ Protected domain reputation

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

MIT License - feel free to use for commercial or personal projects

## 🆘 Support

For issues or questions:
1. Check the documentation
2. Review existing issues
3. Create a new issue with details

## 🙏 Acknowledgments

- [Resend](https://resend.com) - Email sending API
- [ZeroBounce](https://zerobounce.net) - Email verification
- [Express](https://expressjs.com) - Web framework
- [XLSX](https://sheetjs.com) - Excel file handling

---

**Built with ❤️ for effective email marketing**
