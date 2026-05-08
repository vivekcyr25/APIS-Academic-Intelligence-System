import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  clearIndexedDbPersistence,
  terminate
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics, logEvent } from 'firebase/analytics';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// VALIDATE CONFIG
const missingKeys = Object.entries(firebaseConfig)
  .filter(([_, value]) => !value || value === 'undefined')
  .map(([key]) => key);

if (missingKeys.length > 0) {
  console.error(`[Firebase Config] Missing environment variables: ${missingKeys.join(', ')}`);
  console.warn('[Firebase Config] Ensure VITE_FIREBASE_* variables are set in your deployment environment.');
}

// SAFE INITIALIZATION GUARD
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Configure Firestore with Multi-Tab Persistence
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

export const auth = getAuth(app);

// Initialize App Check for Production Security
if (typeof window !== 'undefined' && import.meta.env.VITE_RECAPTCHA_SITE_KEY) {
  initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(import.meta.env.VITE_RECAPTCHA_SITE_KEY),
    isTokenAutoRefreshEnabled: true
  });
}

export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export const trackEvent = (name: string, params?: object) => {
  if (analytics) logEvent(analytics, name, params);
};

// Security: Helper to clear cache on logout
export const clearFirebaseCache = async () => {
  await terminate(db);
  await clearIndexedDbPersistence(db);
};

export default app;
