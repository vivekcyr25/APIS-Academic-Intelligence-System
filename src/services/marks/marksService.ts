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
  mte: number;
  ete: number;
  total: number;
  grade: string;
  createdAt: any;
}

const calculateGrade = (total: number): string => {
  if (total >= 90) return 'O';
  if (total >= 80) return 'A+';
  if (total >= 70) return 'A';
  if (total >= 60) return 'B';
  if (total >= 50) return 'C';
  if (total >= 40) return 'E';
  return 'F';
};

export const addMark = async (userId: string, data: Partial<MarkRecord>) => {
  const total = (data.ca1 || 0) + (data.ca2 || 0) + (data.mte || 0) + (data.ete || 0);
  const mark: MarkRecord = {
    userId,
    subject: data.subject || 'Unknown',
    ca1: data.ca1 || 0,
    ca2: data.ca2 || 0,
    mte: data.mte || 0,
    ete: data.ete || 0,
    total,
    grade: calculateGrade(total),
    createdAt: serverTimestamp(),
  };

  const result = await addDoc(collection(db, 'marks'), mark);
  await logActivity(userId, 'CREATE_MARK', `Added record for ${mark.subject} with total ${mark.total}`);
  return result;
};

export const updateMark = async (id: string, data: Partial<MarkRecord>) => {
  const existingDoc = doc(db, 'marks', id);
  // Re-calculate total and grade if needed
  if (data.ca1 !== undefined || data.ca2 !== undefined || data.mte !== undefined || data.ete !== undefined) {
    // This assumes full data is provided or we fetch it first. 
    // Simplified for now:
    const total = (data.ca1 || 0) + (data.ca2 || 0) + (data.mte || 0) + (data.ete || 0);
    data.total = total;
    data.grade = calculateGrade(total);
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
