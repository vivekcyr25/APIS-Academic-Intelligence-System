# APIS AI — Academic Intelligence System

[![Production Ready](https://img.shields.io/badge/Status-Production--Ready-emerald?style=for-the-badge)](https://apis-ai.web.app)
[![Security Hardened](https://img.shields.io/badge/Security-Hardened-blue?style=for-the-badge)](ARCHITECTURE.md)
[![PWA Enabled](https://img.shields.io/badge/PWA-Enabled-violet?style=for-the-badge)](https://apis-ai.web.app)

**A calm, adaptive academic operating system with secure intelligence infrastructure and offline-first resilience.**

APIS AI is architected for privacy, security, and long-term academic evolution. It provides a production-grade environment for managing academic memory with ambient intelligence synthesis.

---

## 🏛 Architecture Overview

APIS AI utilizes a **Hybrid Secure Layer** architecture to protect sensitive intelligence keys:

- **Frontend**: A high-performance Vite React SPA with IndexedDB persistence.
- **Secure Proxy Layer**: Vercel Serverless Functions (`/api/*`) handle Gemini AI synthesis and Turnstile verification.
- **Persistence Layer**: Multi-tab Firestore synchronization with strict security rules.

## 🧠 Intelligence Philosophy

The platform focuses on **Ambient Intelligence**:
1. **Resilient Memory**: Your data is yours. Local-first persistence ensures availability.
2. **Secure Synthesis**: AI requests are proxied via serverless functions. No API keys are exposed to the browser.
3. **Operational Trust**: Transparent telemetry and automated backups guarantee academic continuity.

## 🚀 Key Features

- **Intelligence Dashboard**: Real-time SGPA vectors and trend analysis.
- **Neural Synopsis**: Secure, proxied Gemini synthesis for academic reflection.
- **Offline Resilience**: 100% functional without network using service worker persistence.
- **Secure Backup**: One-click JSON/PDF academic memory exports.
- **PWA Excellence**: Installable on iOS/Android with native-like ergonomics.

## 📦 Deployment & Setup

### 1. Environment Configuration
Copy `.env.example` to `.env` and configure your keys.
- **Public Keys**: Start with `VITE_` (exposed to client).
- **Private Secrets**: No prefix (used only in `/api` functions).

### 2. Local Development
```bash
npm install
npm run dev
```

### 3. Production Deployment (Vercel)
The project is pre-configured for Vercel Serverless Functions.
1. Connect your GitHub repository to Vercel.
2. Add your `GEMINI_API_KEY` and `TURNSTILE_SECRET_KEY` in Vercel Environment Variables.
3. Deploy.

## 🛠 Tech Stack

- **UI**: React + Vite + Framer Motion + Tailwind CSS
- **Intelligence**: Google Gemini Pro (Proxied)
- **Backend**: Firebase (Auth, Firestore, App Check)
- **Infrastructure**: Vercel Serverless Functions + Workbox PWA

---
*Designed & Engineered by Vivek Sharma. Built for academic resilience.*
