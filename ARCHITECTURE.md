# APIS AI Architecture Overview

This document provides a deep dive into the engineering principles and structural design of the Academic Intelligence System.

## 🏗 System Design Pillars

### 1. Offline-First Resilience (IndexedDB + Service Worker)
APIS AI utilizes a sophisticated persistence layer that ensures data availability even during total network failure.
- **Persistence**: Firebase `persistentLocalCache` with `persistentMultipleTabManager` ensures synchronization across all open browser tabs.
- **Service Worker**: Manages asset caching for instant startup and offline readiness.

### 2. Secure Intelligence Infrastructure (Gemini + Turnstile)
The AI and security integrations use a **Hybrid Secure Layer** to prevent client-side exposure of privileged keys.
- **Secure Proxy**: A dedicated `/api/ai` serverless function handles Gemini synthesis, ensuring the `GEMINI_API_KEY` remains strictly server-side.
- **Identity Verification**: Turnstile tokens are verified via `/api/verify` before critical auth operations, protecting the `TURNSTILE_SECRET_KEY`.

### 3. Telemetry & Observability
Inspired by modern SRE practices, the platform monitors its own health.
- **Events**: Every critical interaction (backup, sync, failure) is logged via `telemetryService.ts`.
- **Latency Monitoring**: We track Firestore, AI Proxy, and Formspree latency to identify operational bottlenecks.

## 📂 Directory Structure

```
.
├── api/               # Vercel Serverless Functions (Secure Proxy)
├── public/            # Static assets & PWA icons
├── src/
│   ├── components/    # Glassmorphic UI & Animations
│   ├── services/      # Infrastructure & Logic
│   │   ├── ai/        # Proxied Intelligence Interface
│   │   └── firebase/  # Secured Persistence Layer
│   └── ...
└── ...
```

## 🔐 Security Hardening
- **Server-Side Secrets**: Privileged keys (Gemini, Turnstile Secret) are never bundled into the frontend.
- **Environment Isolation**: Separation between `VITE_` (public) and non-prefixed (private) variables.
- **Firebase App Check**: Protects Firestore from unauthorized access via device attestation.
- **Identity Isolation**: Strict Firestore rules ensure users can only access their own academic memory.
- **PII Protection**: Feedback and telemetry logs are stripped of sensitive data before submission.

## 📈 Engineering Methodology
The development follows a **Structured Lifecycle Engineering** approach:
- **Phase-Gate Process**: Each feature transition (e.g., from v1.1.0 to v1.2.0) requires an audit for hydration stability and UX consistency.
- **Quality-First**: Prioritizing 60FPS interaction and <200ms sync latency over rapid feature expansion.

---
*Building a resilient future for academic memory.*
