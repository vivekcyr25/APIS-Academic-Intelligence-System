import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, logEvent } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// SAFE INITIALIZATION GUARD
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// PERSISTENCE CLEANUP UTILITY
export const clearFirebaseCache = async () => {
  try {
    const { terminate, clearIndexedDbPersistence } = await import('firebase/firestore');
    await terminate(db);
    await clearIndexedDbPersistence(db);
  } catch (e) {
    console.error('Firebase cleanup failed:', e);
  }
};

// TELEMETRY WRAPPER
export const trackEvent = (event: string, params?: Record<string, any>) => {
  try {
    const analytics = getAnalytics(app);
    logEvent(analytics, event, params);
  } catch (e) {
    // Analytics may fail in some environments (SSR, Adblockers)
  }
};

export default app;
