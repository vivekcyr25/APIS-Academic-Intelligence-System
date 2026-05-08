# APIS AI — Deployment Guide (v1.2.0)

This document outlines the professional deployment workflow for APIS AI, ensuring zero-downtime and safe PWA rollouts.

## 🚀 Deployment Pipeline
### 1. Version Tagging
Before every release, update the version in `package.json` and `src/components/layout/TopNav.tsx`.
```bash
git tag -a v1.2.x -m "Release v1.2.x: [Brief Description]"
```

### 2. Build Verification
Ensure the production build is clean and all TypeScript types are resolved.
```bash
npm run build
```

### 3. Staging Deployment
Deploy to the staging environment first to verify the Service Worker update flow and Firestore rule compatibility.
```bash
# Example for Firebase Hosting
firebase deploy --only hosting:staging
```

### 4. Production Release
Once staging is validated, promote the build to production.
```bash
firebase deploy --only hosting:production,firestore:rules
```

## 📡 PWA Update Orchestration
- **Auto-Update**: The app is configured with `registerType: 'autoUpdate'`. 
- **Cache Invalidation**: Every deploy invalidates the `sw.js` hash, triggering a background download in user browsers.
- **Force Refresh**: In extreme cases, the `onNeedRefresh` hook in `App.tsx` can be used to notify users of a mandatory update.

## 🛡️ Security Hardening
- **App Check**: Ensure the `VITE_RECAPTCHA_SITE_KEY` is correctly set in the production environment.
- **API Key Restrictions**: Verify that the Firebase API key is restricted to the production domain in the Google Cloud Console.

## 📊 Monitoring Post-Release
1. Check **Firebase Analytics** for real-time engagement.
2. Monitor **Crashlytics/Telemetry** for unexpected spikes in `exception` events.
3. Verify `sync_latency` metrics to ensure Firestore performance is within bounds (target < 300ms).

---
*Last Updated: 2026-05-08 | APIS Operations*
