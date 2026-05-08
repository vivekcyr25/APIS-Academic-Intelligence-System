import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, logEvent } from 'firebase/analytics';

/**
 * APIS FIREBASE ARCHITECTURE (RECOVERY v2.0)
 * Professional initialization layer with environment hardening.
 */

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// --- CONFIGURATION VALIDATION ---
const isConfigValid = Object.values(firebaseConfig).every(
  (val) => val && !val.includes('your_') && val !== 'undefined'
);

if (!isConfigValid) {
  console.warn(
    '[APIS:FIREBASE] Critical: Invalid or placeholder configuration detected. Authentication features will be disabled.'
  );
}

// --- INITIALIZATION ---
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// --- TELEMETRY ---
export const trackEvent = (event: string, params?: Record<string, any>) => {
  try {
    const analytics = getAnalytics(app);
    logEvent(analytics, event, params);
  } catch (e) {
    // Analytics is non-critical; fails silently
  }
};

// --- SYSTEM UTILITIES ---
export const clearFirebaseCache = async () => {
  try {
    const { terminate, clearIndexedDbPersistence } = await import('firebase/firestore');
    await terminate(db);
    await clearIndexedDbPersistence(db);
  } catch (e) {
    console.error('[APIS:FIREBASE] Cache cleanup failed:', e);
  }
};

export default app;
