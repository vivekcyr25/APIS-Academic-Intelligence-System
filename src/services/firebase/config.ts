import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, logEvent } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBzXiQuUXNdaJb_Bg6Kk3VrfEfADc5JBRo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "gen-lang-client-0107179257.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "gen-lang-client-0107179257",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "gen-lang-client-0107179257.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "913521921132",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:913521921132:web:c7cd2fbc77c7ab8957dc49",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-JSWQSRRDXD"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Telemetry Wrapper
export const trackEvent = (event: string, params?: Record<string, any>) => {
  try {
    const analytics = getAnalytics(app);
    logEvent(analytics, event, params);
  } catch (e) {
    // Analytics failures are non-blocking
  }
};

// Cache Cleanup
export const clearFirebaseCache = async () => {
  try {
    const { terminate, clearIndexedDbPersistence } = await import('firebase/firestore');
    await terminate(db);
    await clearIndexedDbPersistence(db);
  } catch (e) {
    console.error('Firebase cleanup failed:', e);
  }
};

export default app;
