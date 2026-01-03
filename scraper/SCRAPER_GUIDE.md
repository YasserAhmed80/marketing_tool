# 🏢 Google Maps Real Estate Scraper - User Guide

## 🎯 What This Does

Scrapes Google Maps to find real estate developers, brokers, and agents across 7 MENA countries:
- Egypt
- Saudi Arabia  
- United Arab Emirates
- Algeria
- Iraq
- Sudan
- Yemen

**Extracts:** Name, Phone, Email (from websites)

---

## ⚠️ IMPORTANT WARNINGS

### **Before You Start:**
1. ✅ **Connect to VPN** (ProtonVPN free recommended)
2. ✅ **Close Excel** if `real_estate_leads.xlsx` is open
3. ✅ **Understand risks** - This violates Google ToS
4. ✅ **Be patient** - Scraping is slow (100 businesses/hour)

### **Legal Disclaimer:**
- This is for educational purposes
- Use at your own risk
- Scraping may violate Terms of Service
- Your IP can be blocked without VPN

---

## 🚀 Quick Start

### **Step 1: Install Dependencies**

```bash
cd scraper
npm install
```

### **Step 2: Connect VPN**

1. Open ProtonVPN
2. Connect to any server
3. Verify: https://whatismyipaddress.com

### **Step 3: Run Scraper**

```bash
node google_maps_scraper.js
```

### **Step 4: Wait**

- Script will ask: "Is your VPN connected?"
- Type: `yes`
- Browser will open automatically
- Watch it scrape (don't close!)

---

## 📊 What to Expect

### **Speed:**
- 50-100 businesses per hour
- 100 businesses per session (safety limit)
- Need to run multiple sessions for more

### **Results Per Session:**
- ~100 businesses with names and phones
- ~40-60 with emails (after email finder)

### **For All 7 Countries:**
- Estimated: 2,000-5,000 businesses total
- Time needed: 20-50 sessions
- Days needed: 10-25 days (at 2 sessions/day)

---

## 📁 Output Files

### **real_estate_leads.xlsx**

| name | phone | email | country | city | category | scraped_date |
|------|-------|-------|---------|------|----------|--------------|
| ABC Real Estate | +971... | | UAE | Dubai | Real estate developer | 2026-01-02 |

---

## 🔄 Workflow

### **Session 1: Scrape 100 Businesses**

```bash
# 1. Connect VPN
# 2. Run scraper
node google_maps_scraper.js

# 3. Wait ~1 hour
# 4. Script stops at 100 businesses
# 5. Results saved to real_estate_leads.xlsx
```

### **Break: 1 Hour**

- Change VPN server
- Check results in Excel
- Prepare for next session

### **Session 2: Scrape Next 100**

```bash
# Script automatically continues from where it left off
node google_maps_scraper.js
```

### **Repeat Until Done**

---

## 📧 Finding Emails

### **After Scraping:**

```bash
# This will visit websites and find emails
node email_finder.js
```

**Note:** Email finding is slow and has low success rate (40-60%)

**Better option:** Use Hunter.io or similar service

---

## 🛡️ Safety Tips

### **To Avoid Being Blocked:**

1. **Use VPN** - Always!
2. **Change VPN server** every 100 businesses
3. **Take breaks** - 1 hour between sessions
4. **Don't rush** - Let delays work
5. **Monitor browser** - Watch for captchas

### **If You Get Blocked:**

1. Stop immediately
2. Change VPN server
3. Wait 24 hours
4. Resume with new IP

---

## 📊 Expected Results

### **Total Potential Leads:**

| Country | Major Cities | Est. Businesses |
|---------|--------------|-----------------|
| Egypt | 5 | 500-1,000 |
| Saudi Arabia | 5 | 500-1,000 |
| UAE | 5 | 500-1,000 |
| Algeria | 5 | 300-500 |
| Iraq | 5 | 300-500 |
| Sudan | 5 | 200-300 |
| Yemen | 5 | 100-200 |
| **TOTAL** | **35** | **2,400-4,500** |

---

## 🎯 Realistic Timeline

### **Conservative Approach (Recommended):**

**Week 1:**
- 2 sessions/day × 100 businesses = 200/day
- 7 days × 200 = 1,400 businesses
- **Result:** ~1,400 leads with phones

**Week 2:**
- Continue scraping
- 7 days × 200 = 1,400 more
- **Result:** ~2,800 total leads

**Week 3:**
- Find emails from websites
- Verify with ZeroBounce
- **Result:** ~1,200 verified emails (40% success)

---

## 💡 Pro Tips

### **To Get More Emails:**

1. **Use Hunter.io** - 50 free searches/month
2. **Check LinkedIn** - Many list emails
3. **Call them** - Ask for email directly
4. **Use contact forms** - On their websites

### **To Speed Up:**

1. **Run multiple VPNs** - Different computers
2. **Hire VA** - Someone to run it for you
3. **Buy Outscraper** - $49 for 5,000 instant results

---

## ⚠️ Troubleshooting

### **Problem: "VPN not connected"**
- Solution: Connect to ProtonVPN first

### **Problem: "Browser won't open"**
- Solution: Run `npm install` again

### **Problem: "No results found"**
- Solution: Google Maps layout changed, script needs update

### **Problem: "IP blocked"**
- Solution: Change VPN server, wait 24 hours

### **Problem: "Script crashes"**
- Solution: Results are saved, just run again

---

## 📈 Success Metrics

### **Good Session:**
- 80-100 businesses scraped
- 60-80 with phone numbers
- No errors or blocks
- Saved to Excel successfully

### **Bad Session:**
- <50 businesses
- Many errors
- Got blocked
- Need to change VPN

---

## 🎯 Next Steps After Scraping

### **1. Clean Data**
```bash
# Remove duplicates
node ../remove_duplicates.js
```

### **2. Find Emails**
- Use Hunter.io for top prospects
- Or run email_finder.js (slow)

### **3. Verify Emails**
```bash
# Use your ZeroBounce credits
node ../zerobounce_verify.js
```

### **4. Import to Email Tool**
- Copy to `emails_verified_to_send.xlsx`
- Start sending 100/day

---

## 📞 Alternative: Just Use Phones

**You have phones!** Consider:
- WhatsApp marketing
- SMS campaigns
- Direct calls
- Much higher response rate than email

---

## ✅ Summary

**What you get:**
- ✅ 2,000-4,500 real estate contacts
- ✅ Names and phone numbers (90%+)
- ✅ Emails (40-60% after finding)
- ✅ Organized by country/city

**Time investment:**
- Setup: 30 minutes
- Scraping: 10-25 days (2 sessions/day)
- Email finding: 3-5 days
- **Total: 2-4 weeks**

**Cost:**
- $0 (completely free!)
- Just need free VPN

---

## 🚀 Ready to Start?

```bash
# 1. Connect VPN
# 2. Run scraper
cd scraper
node google_maps_scraper.js

# 3. Type 'yes' when asked
# 4. Watch it work
# 5. Wait for 100 businesses
# 6. Take 1 hour break
# 7. Repeat
```

**Good luck with your lead generation!** 🎯
