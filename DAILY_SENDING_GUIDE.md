# 📧 Daily Email Sending Guide

## ✅ **System Updated!**

### **New Configuration:**

**File:** `emails_verified_to_send.xlsx`  
**Batch Size:** 100 emails per day  
**Delay:** 2 seconds between emails  
**Time:** ~3-4 minutes per batch  

---

## 🎯 **How It Works:**

### **Daily Sending Schedule:**

**Day 1:**
- Send 100 emails (first 100 unsent from file)
- Time: 3-4 minutes
- Mark as sent in Excel

**Day 2:**
- Send next 100 emails
- Time: 3-4 minutes
- Continue...

**And so on...**

---

## 🚀 **How to Send:**

### **Step 1: Prepare File**
- Make sure `emails_verified_to_send.xlsx` is in the project folder
- File should have verified emails only
- Columns: name, email, (other columns optional)

### **Step 2: Open Dashboard**
```
http://localhost:3000
```

### **Step 3: Click "إرسال الرسائل" (Send Emails)**
- System will send 100 emails
- Shows progress
- Saves status to Excel

### **Step 4: Wait 24 Hours**
- Come back tomorrow
- Click send again
- Next 100 emails will be sent

---

## 📊 **Tracking:**

**Excel columns updated:**
- `status`: success/failed
- `reason`: Error message if failed
- `email_count`: Number of times sent

**Dashboard shows:**
- Total emails
- Sent emails
- Failed emails
- Pending emails

---

## ⏱️ **Timeline Example:**

**If you have 1,000 verified emails:**

| Day | Emails Sent | Cumulative | Remaining |
|-----|-------------|------------|-----------|
| Day 1 | 100 | 100 | 900 |
| Day 2 | 100 | 200 | 800 |
| Day 3 | 100 | 300 | 700 |
| ... | ... | ... | ... |
| Day 10 | 100 | 1,000 | 0 |

**Total time: 10 days**

---

## 💡 **Why 100 Per Day?**

**Benefits:**
- ✅ Stays within Resend free tier limits
- ✅ Builds sender reputation gradually
- ✅ Easier to monitor and fix issues
- ✅ Lower risk of spam complaints
- ✅ Better deliverability

**Resend Free Tier:**
- 100 emails/day
- 3,000 emails/month
- Perfect for gradual sending

---

## 🔄 **How System Tracks Progress:**

**The system automatically:**
1. Reads `emails_verified_to_send.xlsx`
2. Finds emails without `status` (unsent)
3. Sends first 100 unsent emails
4. Marks them as sent
5. Saves to Excel

**Next day:**
- Skips already sent emails
- Sends next 100 unsent
- Continues until all done

---

## 📋 **Best Practices:**

### **Daily Routine:**
```
1. Open dashboard: http://localhost:3000
2. Check stats (how many sent, how many remaining)
3. Click "إرسال الرسائل"
4. Wait 3-4 minutes
5. Check Resend dashboard for delivery
6. Come back tomorrow
```

### **Monitor Resend:**
- Check bounce rate daily
- Should be <5% with verified emails
- If higher, stop and investigate

### **Backup:**
- Keep backup of `emails_verified_to_send.xlsx`
- In case you need to restart

---

## ⚠️ **Important Notes:**

**DO:**
- ✅ Send 100 emails per day
- ✅ Check Resend dashboard daily
- ✅ Monitor bounce rate
- ✅ Keep Excel file backed up

**DON'T:**
- ❌ Send more than 100/day (violates free tier)
- ❌ Send to unverified emails
- ❌ Ignore high bounce rates
- ❌ Delete Excel file (it tracks progress)

---

## 🎯 **Quick Start:**

**Today:**
1. Make sure `emails_verified_to_send.xlsx` exists
2. Open http://localhost:3000
3. Click "إرسال الرسائل"
4. Wait 3-4 minutes
5. Check results

**Tomorrow:**
1. Open http://localhost:3000
2. Click "إرسال الرسائل" again
3. Next 100 will be sent

**Repeat daily until all emails sent!**

---

## 📈 **Expected Results:**

**With verified emails:**
- Bounce rate: 2-5%
- Delivery rate: 95-98%
- Inbox placement: 70-80%
- Spam folder: 20-30%

**Much better than before!** ✅

---

**Your system is ready to send 100 emails per day!** 🚀
