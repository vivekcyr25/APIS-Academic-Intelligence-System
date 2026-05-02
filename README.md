# 🎓 LPU AI Academic Portal — Pro Edition

> **A full-stack, AI-powered academic management system** for Lovely Professional University students — featuring real-time UMS data sync, Gemini AI chatbot, WhatsApp integration, and advanced admin analytics.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-blue?style=for-the-badge&logo=github)](https://vivekcyr25.github.io/CA3-/)
[![Backend API](https://img.shields.io/badge/Backend%20API-Render-green?style=for-the-badge&logo=render)](https://ca3-s3xb.onrender.com)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=nodedotjs)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen?style=for-the-badge&logo=mongodb)](https://cloud.mongodb.com)

---

## ✨ Core Features

| Feature | Description |
|---------|-------------|
| 🔐 **Role-Based Auth** | Admin (`12510200`) and Student (`12510201–08`) roles with JWT |
| 📊 **Academic Dashboard** | Marks table, GPA stats, animated counters, grade badges |
| 🔄 **UMS Sync** | Puppeteer scraper syncs timetable, marks & attendance from LPU UMS |
| 🤖 **Gemini AI Chatbot** | Natural language Q&A — *"Will I be free after 3 PM?"* |
| 📱 **WhatsApp Bot** | Students can query timetable/marks/attendance via WhatsApp (Twilio) |
| ⚠️ **Proactive Nudges** | Auto-WhatsApp alerts when attendance drops below 75% |
| ✨ **Study Sprint** | AI generates a personalized 5-day subject study plan |
| 📈 **CGPA Trend Chart** | Line chart showing CGPA progression across semesters |
| 👨‍💼 **Batch Analytics** | Admin view — all at-risk students in one table with risk badges |
| 🗑️ **Privacy (GDPR)** | Students can delete all synced data with one click |
| 📄 **PDF Transcript** | Official LPU-styled printable transcript via html2pdf |
| 🌙 **Dark / Light Mode** | Persisted in localStorage, applied before first paint |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | HTML5, Vanilla CSS, Vanilla JS, Chart.js, html2pdf.js |
| **Backend** | Node.js 18+, Express.js |
| **Database** | MongoDB (Atlas for production, in-memory for dev) |
| **AI** | Google Gemini 2.0 Flash API |
| **Scraping** | Puppeteer + puppeteer-extra-plugin-stealth |
| **Messaging** | Twilio WhatsApp API |
| **Auth** | JWT (jsonwebtoken) + bcryptjs |
| **Hosting** | GitHub Pages (frontend) + Render (backend) |

---

## 🚀 Local Setup

### 1. Clone the Repository
```bash
git clone https://github.com/vivekcyr25/CA3-.git
cd CA3-
npm install
```

### 2. Create a `.env` file
Create a file called `.env` in the root directory with the following keys:

```env
# ── MongoDB Atlas (Required for persistent data) ──────────────────────────────
# Get from: https://cloud.mongodb.com → Connect → Drivers
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/lpu_portal

# ── Gemini AI (Required for chatbot & study plan) ─────────────────────────────
# Get from: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# ── JWT Secret (Required for authentication) ──────────────────────────────────
# Use any long random string
JWT_SECRET=lpu_super_secret_key_change_this_in_production

# ── Twilio WhatsApp (Optional — required for WhatsApp bot & nudges) ───────────
# Get from: https://console.twilio.com
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# ── Server Port (Optional) ────────────────────────────────────────────────────
PORT=3000
```

### 3. Run the Development Server
```bash
node server.js
# Server starts at http://localhost:3000
```

### 4. Install Optional Scraping Dependencies
> Required only if you want real UMS sync (Puppeteer):
```bash
npm install puppeteer puppeteer-extra puppeteer-extra-plugin-stealth
```

---

## 🌐 Deployment

### GitHub Pages (Frontend)
The `index.html` is auto-deployed to GitHub Pages on every push to `main`.
🔗 **Live:** https://vivekcyr25.github.io/CA3-/

### Render (Backend API)
The Node.js server is hosted on Render's free tier.
🔗 **API Base:** https://ca3-s3xb.onrender.com/api

**Render Environment Variables** — Set these in the Render dashboard under **Environment**:
- `MONGO_URI` — MongoDB Atlas connection string
- `GEMINI_API_KEY` — Gemini API key
- `JWT_SECRET` — JWT signing secret
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM` — for WhatsApp

> ⚠️ Render free tier spins down after inactivity — first login may take up to 60 seconds. The portal shows a "Waking up server…" message automatically.

---

## 🔑 Default Login Credentials

| Role | Username | Password |
|------|----------|----------|
| **Admin** | `12510200` | `Vivek50` |
| **Student** | `12510201` | `12510201` |
| **Student** | `12510202` | `12510202` |
| *(and so on)* | `12510203–08` | *(same as username)* |

---

## 📁 Project Structure

```
CA3-/
├── index.html              # Full frontend (SPA)
├── server.js               # Express entry point
├── database.js             # Seed data with mock timetable & history
├── umsService.js           # Puppeteer UMS scraper
├── nudgeService.js         # Proactive WhatsApp alert system
├── models/
│   ├── Student.js          # Mongoose schema (full extended)
│   └── ActivityLog.js      # Admin action logging
├── routes/
│   ├── authRoutes.js       # Login + token validation
│   ├── studentRoutes.js    # GET/PUT student data
│   ├── syncRoutes.js       # POST sync, DELETE privacy
│   ├── chatRoutes.js       # Gemini AI chatbot
│   ├── aiRoutes.js         # AI performance analysis
│   ├── whatsappRoutes.js   # Twilio webhook
│   └── activityRoutes.js   # Admin activity logs
└── middleware/
    └── authMiddleware.js   # JWT protect + adminOnly guards
```

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/login` | ❌ | Login and get JWT |
| `GET` | `/api/student/me` | ✅ | Validate token silently |
| `GET` | `/api/student/:regNo` | ✅ | Get student data |
| `PUT` | `/api/student/:regNo/marks` | Admin | Update marks |
| `POST` | `/api/student/sync` | Student | Sync from UMS |
| `DELETE` | `/api/student/privacy` | Student | Delete synced data |
| `POST` | `/api/chat` | ✅ | Gemini AI chatbot |
| `POST` | `/api/ai-analysis` | ✅ | Performance analysis |
| `POST` | `/api/whatsapp/webhook` | ❌ | Twilio webhook |
| `GET` | `/api/activity` | Admin | Activity logs |

---

## 👨‍💻 Developer

**Vivek** — B.Tech CSE, Lovely Professional University
📧 Reg No: 12510200 (Admin)
🔗 [GitHub Repository](https://github.com/vivekcyr25/CA3-)

---

*Built as CA3 Project 2025 — LPU Academic Portal Pro Edition*
