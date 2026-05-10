import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config.ts';

const logActivity = async (userId: string, action: string, details: string) => {
  try {
    await addDoc(collection(db, 'activity_logs'), {
      userId,
      action,
      details,
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    // Activity logging failed silently
  }
};

export interface MarkRecord {
  id?: string;
  userId: string;
  subject: string;
  ca1: number;
  ca2: number;
  assignments: number;
  mte: number;
  lab: number;
  ete: number;
  total: number;
  grade: string;
  percentage: number;
  createdAt: any;
}

export const calculateGrade = (percentage: number): string => {
  if (percentage >= 90) return 'O';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  return 'F';
};

export const calculateDynamicTotal = (data: Partial<MarkRecord>) => {
  // Configurable Weightages
  const W_CA1 = 0.20; // 20%
  const W_CA2 = 0.20; // 20%
  const W_ASS = 0.10; // 10%
  const W_ETE = 0.50; // 50%
  
  // Example max marks for normalization (assuming standard configuration)
  const MAX_CA = 30;
  const MAX_ASS = 100;
  const MAX_ETE = 100;

  const safeVal = (v: any) => isNaN(parseFloat(v)) ? 0 : Math.max(0, parseFloat(v));

  const ca1 = safeVal(data.ca1);
  const ca2 = safeVal(data.ca2);
  const ass = safeVal(data.assignments);
  const ete = safeVal(data.ete);

  // Normalize to 100% scale
  const normCA1 = (ca1 / MAX_CA) * 100 * W_CA1;
  const normCA2 = (ca2 / MAX_CA) * 100 * W_CA2;
  const normAss = (ass / MAX_ASS) * 100 * W_ASS;
  const normEte = (ete / MAX_ETE) * 100 * W_ETE;

  // Additional lab/mte could be factored based on subject type, but using a unified normalized total here
  let finalPercentage = normCA1 + normCA2 + normAss + normEte;
  
  // Fallback for custom logic if mte or lab are entered directly without weightages 
  // (In real LPU systems, MTE replaces CA2 or is factored, we'll sum raw and clamp for safety if needed)
  if (finalPercentage === 0 && (data.mte || data.lab)) {
      const rawTotal = ca1 + ca2 + safeVal(data.mte) + ete + safeVal(data.lab);
      finalPercentage = (rawTotal / 260) * 100; // rough scale if weightages unused
  }

  // Never exceed 100%
  finalPercentage = Math.min(100, Math.max(0, finalPercentage));
  
  return {
    total: Math.round(finalPercentage), // Store as rounded total out of 100
    percentage: parseFloat(finalPercentage.toFixed(2)),
    grade: calculateGrade(finalPercentage)
  };
};

export const addMark = async (userId: string, data: Partial<MarkRecord>) => {
  const { total, percentage, grade } = calculateDynamicTotal(data);
  const mark: MarkRecord = {
    userId,
    subject: data.subject || 'Unknown',
    ca1: data.ca1 || 0,
    ca2: data.ca2 || 0,
    assignments: data.assignments || 0,
    mte: data.mte || 0,
    lab: data.lab || 0,
    ete: data.ete || 0,
    total,
    percentage,
    grade,
    createdAt: serverTimestamp(),
  };

  const result = await addDoc(collection(db, 'marks'), mark);
  await logActivity(userId, 'CREATE_MARK', `Added record for ${mark.subject} with grade ${mark.grade}`);
  return result;
};

export const updateMark = async (id: string, data: Partial<MarkRecord>) => {
  const existingDoc = doc(db, 'marks', id);
  if (data.ca1 !== undefined || data.ca2 !== undefined || data.assignments !== undefined || data.ete !== undefined || data.mte !== undefined || data.lab !== undefined) {
    const { total, percentage, grade } = calculateDynamicTotal(data);
    data.total = total;
    data.percentage = percentage;
    data.grade = grade;
  }
  return await updateDoc(existingDoc, data);
};

export const deleteMark = async (id: string, userId?: string) => {
  const result = await deleteDoc(doc(db, 'marks', id));
  if (userId) await logActivity(userId, 'DELETE_MARK', `Removed record ID: ${id}`);
  return result;
};

export const subscribeToMarks = (userId: string, callback: (marks: MarkRecord[]) => void) => {
  const q = query(collection(db, 'marks'), where('userId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const marks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MarkRecord));
    callback(marks);
  });
};
