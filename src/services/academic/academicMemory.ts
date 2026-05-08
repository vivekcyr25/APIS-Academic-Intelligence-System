import {
  collection, doc, getDocs, serverTimestamp, setDoc, query, orderBy
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Semester, Subject, AcademicMemory, SemesterDelta, MemoryVector } from '../../types/academic-v2';

export const calculateAcademicMemory = async (userId: string): Promise<AcademicMemory | null> => {
  // Fetch all completed/active semesters
  const semsQuery = query(collection(db, 'users', userId, 'semesters'), orderBy('number', 'asc'));
  const semsSnap = await getDocs(semsQuery);
  const semesters = semsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Semester));
  
  if (semesters.length < 2) return null; // Need at least 2 semesters for deltas

  // Calculate Deltas
  const deltas: SemesterDelta[] = [];
  for (let i = 1; i < semesters.length; i++) {
    const prev = semesters[i - 1];
    const curr = semesters[i];
    
    // Only compare if both have valid data
    if (prev.totalCredits > 0 && curr.totalCredits > 0) {
      deltas.push({
        semesterId: curr.id!,
        sgpaDelta: parseFloat((curr.sgpa - prev.sgpa).toFixed(2)),
        attendanceDelta: parseFloat((curr.avgAttendance - prev.avgAttendance).toFixed(1)),
        creditCompletionRate: curr.totalCredits > 0 ? (curr.earnedCredits / curr.totalCredits) * 100 : 0
      });
    }
  }

  // Fetch all subjects across semesters to find weaknesses
  const subjectsSnap = await getDocs(collection(db, 'users', userId, 'subjects'));
  const subjects = subjectsSnap.docs.map(d => d.data() as Subject);
  
  // Find weak subjects (e.g. failing or borderline grades)
  const weakCodes = new Set<string>();
  let lowPerformanceCount = 0;
  
  subjects.forEach(sub => {
    if (sub.grade === 'F' || sub.grade === 'E' || sub.grade === 'D' || sub.total < 50) {
      weakCodes.add(sub.code);
      lowPerformanceCount++;
    }
  });

  // Analyze attendance trend
  const lastDelta = deltas[deltas.length - 1];
  let attPattern: MemoryVector['attendancePattern'] = 'erratic';
  if (deltas.every(d => d.attendanceDelta >= 0)) attPattern = 'improving';
  else if (deltas.every(d => d.attendanceDelta <= 0)) attPattern = 'declining';
  else if (Math.abs(lastDelta?.attendanceDelta || 0) < 5) attPattern = 'consistent';

  // Calculate Consistency Score (0-100)
  // Penalize high variance in SGPA
  const sgpaVariance = deltas.reduce((acc, d) => acc + Math.abs(d.sgpaDelta), 0) / deltas.length;
  let consistencyScore = 100 - (sgpaVariance * 15) - (lowPerformanceCount * 5);
  if (consistencyScore < 0) consistencyScore = 0;
  if (consistencyScore > 100) consistencyScore = 100;

  // Determine Burnout Risk
  let burnoutRisk: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (attPattern === 'declining' && lastDelta?.sgpaDelta < -1) burnoutRisk = 'high';
  if (consistencyScore < 40) burnoutRisk = 'critical';
  else if (consistencyScore < 60) burnoutRisk = 'medium';

  const memory: AcademicMemory = {
    userId,
    deltas,
    vectors: {
      subjectWeaknesses: Array.from(weakCodes),
      attendancePattern: attPattern,
      burnoutRisk,
      consistencyScore: parseFloat(consistencyScore.toFixed(1))
    },
    lastCalculated: serverTimestamp() as any
  };

  // Persist to Firestore
  await setDoc(doc(db, 'users', userId, 'analytics', 'memory'), memory);

  return memory;
};
