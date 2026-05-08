# APIS AI — Recovery Procedures

This document provides procedures for recovering academic data in the event of extreme synchronization failures or database corruption.

## 🛡️ Level 1: Browser-Side Recovery
If the UI is frozen or reporting sync errors:
1. **Force Refresh**: `Ctrl + F5` to reload the Service Worker and clear transient memory.
2. **Persistence Reset**: Log out and log back in. This triggers `clearFirebaseCache()`, wiping the local IndexedDB and forcing a fresh pull from Firestore.

## 🛡️ Level 2: Manual Data Extraction (Advanced)
If Firestore is unreachable but local data exists:
1. Open Browser DevTools (`F12`).
2. Navigate to **Application > IndexedDB > firestore/project-id**.
3. Locate the `remoteDocuments` or `targetDocuments` store.
4. Use the console to dump the JSON if necessary (requires technical expertise).

## 🛡️ Level 3: Database Restoration
If a user's cloud data is corrupted:
1. **Academic Archive Restoration**: Ask the user for their latest `.json` export (from Profile Settings).
2. **Import Workflow**: Use the Admin Console (not currently exposed in UI) to push the JSON back into `users/{uid}/semesters` and `users/{uid}/subjects`.

## 🛡️ Level 4: Conflict Resolution Logic
APIS AI follows a "Last-Write-Wins" strategy at the field level.
- If a subject is edited offline on two devices, the version synced last to the cloud will prevail.
- Timeline events are uniquely keyed by `id` to prevent duplication during reconnections.

---
*Last Updated: 2026-05-08 | APIS Operations*
