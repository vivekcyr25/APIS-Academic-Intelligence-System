import { db } from '../firebase/config.ts';
import { doc, getDoc } from 'firebase/firestore';

export interface SystemStatus {
  firebase: boolean;
  ai: boolean;
  timestamp: number;
}

export const checkSystemHealth = async (): Promise<SystemStatus> => {
  const status: SystemStatus = {
    firebase: false,
    ai: false,
    timestamp: Date.now(),
  };

  // Check Firebase (Firestore reachability)
  try {
    await getDoc(doc(db, '_health_', 'check'));
    status.firebase = true;
  } catch (err) {
    // Firestore throws on missing doc but that's still "online"
    const msg = (err as any)?.code || '';
    status.firebase = msg !== 'unavailable';
  }

  // Check Groq AI backend health endpoint
  try {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const res = await fetch(`${baseUrl}/api/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000), // 5s timeout
    });
    if (res.ok) {
      const data = await res.json();
      status.ai = data?.online === true;
    }
  } catch (_) {
    status.ai = false;
  }

  return status;
};
