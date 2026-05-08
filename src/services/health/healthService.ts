import { db, auth } from '../firebase/config.ts';
import { doc, getDoc } from 'firebase/firestore';

export interface SystemStatus {
  firebase: boolean;
  gemini: boolean;
  timestamp: number;
}

export const checkSystemHealth = async (): Promise<SystemStatus> => {
  const status: SystemStatus = {
    firebase: false,
    gemini: false,
    timestamp: Date.now(),
  };

  // Check Firebase (Firestore)
  try {
    // Try to read a dummy doc or just check if db is initialized
    await getDoc(doc(db, '_health_', 'check'));
    status.firebase = true;
  } catch (err) {
    status.firebase = false;
  }

  // Check Gemini (Verify API Key existence)
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    status.gemini = !!apiKey && apiKey.length > 10;
  } catch (err) {
    status.gemini = false;
  }

  return status;
};
