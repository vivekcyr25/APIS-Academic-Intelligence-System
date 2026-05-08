import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { telemetryService, TELEMETRY_EVENTS } from '../telemetry/telemetryService';

export type FeedbackCategory = 'bug' | 'ux' | 'feature' | 'idea' | 'performance' | 'sync' | 'general' | 'friction';

const FORMSPREE_ENDPOINT = import.meta.env.VITE_FORMSPREE_ENDPOINT || 'https://formspree.io/f/mjglejed';
const APP_VERSION = 'v1.2.0';

export const submitFeedback = async (
  userId: string,
  category: FeedbackCategory,
  content: string,
  metadata?: Record<string, any>
) => {
  const startTime = Date.now();
  
  // 1. Prepare Enriched Metadata Payload
  const payload = {
    userId,
    category,
    message: content,
    route: window.location.pathname,
    appVersion: APP_VERSION,
    isPWA: window.matchMedia('(display-mode: standalone)').matches,
    network: {
      online: navigator.onLine,
      effectiveType: (navigator as any).connection?.effectiveType || 'unknown',
      rtt: (navigator as any).connection?.rtt || 0
    },
    device: {
      userAgent: navigator.userAgent,
      language: navigator.language,
      screen: `${window.screen.width}x${window.screen.height}`,
      pixelRatio: window.devicePixelRatio,
      memory: (navigator as any).deviceMemory || 'unknown',
      cores: navigator.hardwareConcurrency || 0
    },
    timestamp: new Date().toISOString(),
    ...metadata
  };

  try {
    // 2. Canonical Persistence (Firestore) — Primary Task
    // We do this first as it is the "source of truth"
    const firestoreRef = collection(db, 'users', userId, 'feedback');
    await addDoc(firestoreRef, {
      ...payload,
      createdAt: serverTimestamp()
    });

    const firestoreLatency = Date.now() - startTime;
    await telemetryService.logEvent(TELEMETRY_EVENTS.FEEDBACK, {
      action: 'firestore_success',
      latency: firestoreLatency
    });

    // 3. Background Formspree Notification (Best Effort)
    // This runs asynchronously to avoid blocking the UI flow
    const submitToFormspree = async (retries = 1): Promise<void> => {
      try {
        const formStart = Date.now();
        const response = await fetch(FORMSPREE_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Formspree failed');
        
        await telemetryService.logEvent(TELEMETRY_EVENTS.FEEDBACK, {
          action: 'formspree_success',
          latency: Date.now() - formStart
        });
      } catch (e) {
        if (retries > 0) {
          setTimeout(() => submitToFormspree(retries - 1), 2000);
        } else {
          await telemetryService.logEvent(TELEMETRY_EVENTS.FEEDBACK, {
            action: 'formspree_silent_fail',
            error: e instanceof Error ? e.message : 'timeout'
          });
        }
      }
    };

    // Fire and forget (it has its own retry logic)
    submitToFormspree();

    return true;
  } catch (error) {
    await telemetryService.logEvent(TELEMETRY_EVENTS.FEEDBACK, {
      action: 'canonical_failure',
      error: error instanceof Error ? error.message : 'firestore_error'
    });
    throw error;
  }
};
