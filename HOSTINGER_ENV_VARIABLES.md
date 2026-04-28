# Hostinger Environment Variables — Copy-Paste Reference
**For:** Node.js App Backend at https://saiscientificas.com  
**Domain:** saiscientificas.com  
**Instructions:** Enter each line as a separate variable in hPanel → Node.js Apps → Your Backend App → Environment Variables

---

## 📝 How to Use This File

1. Open **hPanel → Node.js Applications → backend → Environment Variables**
2. For each line below, click **Add Variable**
3. Copy the **KEY** into the "Variable Name" field
4. Copy the **VALUE** into the "Variable Value" field
5. Click **Save**

---

## ✅ Core Server Settings

| KEY | VALUE |
|-----|-------|
| `PORT` | `4000` |
| `NODE_ENV` | `production` |

---

## 🌐 URLs & CORS

| KEY | VALUE |
|-----|-------|
| `FRONTEND_URL` | `https://saiscientificas.com` |
| `CORS_ORIGIN` | `https://saiscientificas.com` |

---

## 🗄️ Database (Fill after Step 6)

| KEY | VALUE |
|-----|-------|
| `DATABASE_URL` | `postgresql://saiscientificas_usr:PASSWORD@HOST:5432/saiscientificas_db` |

**How to get DATABASE_URL:**
1. Go to hPanel → Databases → PostgreSQL
2. Click your database
3. Copy the connection string
4. Paste here

---

## 🔐 Security Secrets (Generate New)

**Generate with this PowerShell command (run on your PC):**
```powershell
node -e "console.log('JWT: ' + require('crypto').randomBytes(32).toString('hex')); console.log('SESSION: ' + require('crypto').randomBytes(32).toString('hex'))"
```

| KEY | VALUE |
|-----|-------|
| `JWT_SECRET` | [Paste first output from command above] |
| `JWT_EXPIRES_IN` | `7d` |
| `SESSION_SECRET` | [Paste second output from command above] |

---

## 💳 Razorpay Payment Gateway

**How to get keys:**
1. Go to https://dashboard.razorpay.com
2. Click **Settings → API Keys**
3. Copy **Key ID** and **Key Secret**

| KEY | VALUE |
|-----|-------|
| `RAZORPAY_KEY_ID` | `rzp_live_XXXXXXXXXXXXX` |
| `RAZORPAY_KEY_SECRET` | [Your secret from Razorpay] |
| `RAZORPAY_WEBHOOK_SECRET` | [Generated in Step 9] |

---

## 📧 Email (Gmail SMTP)

**How to get Gmail App Password:**
1. Go to https://myaccount.google.com/apppasswords
2. Select Phone: Android (or any device)
3. Copy the 16-character password

| KEY | VALUE |
|-----|-------|
| `EMAIL_HOST` | `smtp.gmail.com` |
| `EMAIL_PORT` | `587` |
| `EMAIL_USER` | `sales@saiscientificas.com` |
| `EMAIL_PASSWORD` | [Gmail App Password] |
| `EMAIL_FROM` | `Sai Scientificas <sales@saiscientificas.com>` |

---

## 🏢 Company Details

| KEY | VALUE |
|-----|-------|
| `COMPANY_NAME` | `Sai Scientificas` |
| `COMPANY_EMAIL` | `sales@saiscientificas.com` |
| `COMPANY_PHONE` | `+91-XXXX-XXXXX` |
| `COMPANY_ADDRESS` | `Your Business Address Here` |
| `COMPANY_GSTIN` | `07XXXXX1234X1ZX` |

---

## 📁 File Upload Settings

| KEY | VALUE |
|-----|-------|
| `UPLOAD_DIR` | `uploads` |
| `MAX_FILE_SIZE` | `5242880` |

---

## ⏱️ Rate Limiting

| KEY | VALUE |
|-----|-------|
| `RATE_LIMIT_WINDOW_MS` | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | `100` |

---

## 🔔 WhatsApp / SMS (Optional — Twilio)

**Leave empty if not using. Optional for SMS notifications.**

| KEY | VALUE |
|-----|-------|
| `TWILIO_ACCOUNT_SID` | [Optional] |
| `TWILIO_AUTH_TOKEN` | [Optional] |
| `TWILIO_WHATSAPP_FROM` | `whatsapp:+14155238886` |

---

## ⚡ Total Variables to Add: 28

**Checklist:**
- [ ] 2 Core Server
- [ ] 2 URLs & CORS
- [ ] 1 Database
- [ ] 3 Security
- [ ] 3 Razorpay
- [ ] 5 Email
- [ ] 5 Company
- [ ] 2 File Upload

---

## ✅ After Adding All Variables

1. Click **Restart** on your Node.js app
2. Wait 30 seconds for restart
3. Test: `https://saiscientificas.com/api/health`

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-03-24T...",
  "environment": "production"
}
```

---

*Last updated: March 24, 2026*
