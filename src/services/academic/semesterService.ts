/**
 * APIS AI — Semester & Subject Firestore Service
 * 
 * All CRUD operations for the v2 academic architecture.
 * Collections: users/{uid}/semesters, users/{uid}/subjects, users/{uid}/profile
 */

import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, getDocs, serverTimestamp,
  setDoc, getDoc, where
} from 'firebase/firestore';
import { db } from '../firebase/config.ts';
import type {
  AcademicProfile, Semester, Subject, CGPARecord, TimelineEvent
} from '../../types/academic-v2.ts';
import { computeSemesterSummary, calculateCGPA } from './academicEngine.ts';

// ─────────────────────────────────────────────────────────
// ACADEMIC PROFILE
// ─────────────────────────────────────────────────────────

export const getAcademicProfile = async (userId: string): Promise<AcademicProfile | null> => {
  const ref = doc(db, 'users', userId, 'profile', 'academic');
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as AcademicProfile) : null;
};

export const saveAcademicProfile = async (
  userId: string,
  profile: Omit<AcademicProfile, 'userId'>
): Promise<void> => {
  const ref = doc(db, 'users', userId, 'profile', 'academic');
  await setDoc(ref, {
    ...profile,
    userId,
    updatedAt: serverTimestamp(),
  }, { merge: true });
};

export const subscribeToAcademicProfile = (
  userId: string,
  callback: (profile: AcademicProfile | null) => void
) => {
  const ref = doc(db, 'users', userId, 'profile', 'academic');
  return onSnapshot(ref, (snap) => {
    callback(snap.exists() ? (snap.data() as AcademicProfile) : null);
  });
};

// ─────────────────────────────────────────────────────────
// SEMESTERS
// ─────────────────────────────────────────────────────────

export const createSemester = async (
  userId: string,
  data: Omit<Semester, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const ref = collection(db, 'users', userId, 'semesters');
  const result = await addDoc(ref, {
    ...data,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return result.id;
};

export const updateSemester = async (
  userId: string,
  semesterId: string,
  data: Partial<Semester>
): Promise<void> => {
  const ref = doc(db, 'users', userId, 'semesters', semesterId);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
};

export const deleteSemester = async (userId: string, semesterId: string): Promise<void> => {
  // Also delete all subjects in this semester
  const subjectsSnap = await getDocs(
    query(collection(db, 'users', userId, 'subjects'), where('semesterId', '==', semesterId))
  );
  const deletes = subjectsSnap.docs.map(d => deleteDoc(d.ref));
  await Promise.all(deletes);
  await deleteDoc(doc(db, 'users', userId, 'semesters', semesterId));
};

export const subscribeToSemesters = (
  userId: string,
  callback: (semesters: Semester[]) => void
) => {
  const q = query(
    collection(db, 'users', userId, 'semesters'),
    orderBy('number', 'asc')
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Semester)));
  });
};

// ─────────────────────────────────────────────────────────
// SUBJECTS
// ─────────────────────────────────────────────────────────

export const addSubject = async (
  userId: string,
  data: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const ref = collection(db, 'users', userId, 'subjects');
  const result = await addDoc(ref, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return result.id;
};

export const updateSubject = async (
  userId: string,
  subjectId: string,
  data: Partial<Subject>
): Promise<void> => {
  const ref = doc(db, 'users', userId, 'subjects', subjectId);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
};

export const deleteSubject = async (userId: string, subjectId: string): Promise<void> => {
  await deleteDoc(doc(db, 'users', userId, 'subjects', subjectId));
};

export const subscribeToSubjects = (
  userId: string,
  callback: (subjects: Subject[]) => void,
  semesterId?: string
) => {
  let q = semesterId
    ? query(
        collection(db, 'users', userId, 'subjects'),
        where('semesterId', '==', semesterId),
        orderBy('credits', 'desc')
      )
    : query(collection(db, 'users', userId, 'subjects'), orderBy('credits', 'desc'));

  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Subject)));
  });
};

// ─────────────────────────────────────────────────────────
// RECOMPUTE & SYNC SEMESTER STATS
// Call after adding/editing/deleting a subject
// ─────────────────────────────────────────────────────────

export const recomputeSemesterStats = async (
  userId: string,
  semesterId: string,
  profile: AcademicProfile
): Promise<void> => {
  const subjectsSnap = await getDocs(
    query(collection(db, 'users', userId, 'subjects'), where('semesterId', '==', semesterId))
  );
  const subjects = subjectsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Subject));
  const summary = computeSemesterSummary(subjects, profile);
  await updateSemester(userId, semesterId, {
    sgpa: summary.sgpa,
    totalCredits: summary.totalCredits,
    earnedCredits: summary.earnedCredits,
    failedCredits: summary.failedCredits,
    avgAttendance: summary.avgAttendance,
  });
};

// ─────────────────────────────────────────────────────────
// CGPA RECORD
// ─────────────────────────────────────────────────────────

export const recomputeCGPA = async (userId: string): Promise<void> => {
  const semestersSnap = await getDocs(
    query(collection(db, 'users', userId, 'semesters'), where('status', '==', 'completed'))
  );
  const history = semestersSnap.docs.map(d => {
    const s = d.data() as Semester;
    return {
      semId: d.id,
      semNumber: s.number,
      sgpa: s.sgpa,
      credits: s.totalCredits,
      earnedCredits: s.earnedCredits,
    };
  });
  const cgpa = calculateCGPA(history);
  const totalCreditsRegistered = history.reduce((a, h) => a + h.credits, 0);
  const totalCreditsEarned = history.reduce((a, h) => a + h.earnedCredits, 0);

  await setDoc(doc(db, 'users', userId, 'analytics', 'cgpa'), {
    userId,
    cgpa,
    totalCreditsRegistered,
    totalCreditsEarned,
    semesterHistory: history,
    trend: history.length >= 2
      ? history[history.length - 1].sgpa > history[history.length - 2].sgpa
        ? 'improving' : 'declining'
      : 'stable',
    updatedAt: serverTimestamp(),
  } as CGPARecord, { merge: true });
};

// ─────────────────────────────────────────────────────────
// TIMELINE EVENTS
// ─────────────────────────────────────────────────────────

export const addTimelineEvent = async (
  userId: string,
  event: Omit<TimelineEvent, 'id'>
): Promise<void> => {
  await addDoc(collection(db, 'users', userId, 'timeline'), event);
};

export const subscribeToTimeline = (
  userId: string,
  semesterId: string,
  callback: (events: TimelineEvent[]) => void
) => {
  const q = query(
    collection(db, 'users', userId, 'timeline'),
    where('semesterId', '==', semesterId),
    orderBy('date', 'asc')
  );
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as TimelineEvent)));
  });
};

// ─────────────────────────────────────────────────────────
// INITIALIZE FIRST-TIME SEMESTERS
// Creates empty semester vaults based on profile
// ─────────────────────────────────────────────────────────

export const initializeSemesters = async (
  userId: string,
  profile: AcademicProfile
): Promise<void> => {
  const existing = await getDocs(collection(db, 'users', userId, 'semesters'));
  if (!existing.empty) return; // Already initialized

  const config = { domain: profile.domain, label: profile.programName };
  for (let i = 1; i <= profile.totalSemesters; i++) {
    await createSemester(userId, {
      number: i,
      label: `${profile.domain === 'school' ? 'Term' : 'Semester'} ${i}`,
      status: i === profile.currentSemester ? 'active' : i < profile.currentSemester ? 'completed' : 'upcoming',
      totalCredits: 0,
      earnedCredits: 0,
      failedCredits: 0,
      sgpa: 0,
      avgAttendance: 0,
    });
  }
};
