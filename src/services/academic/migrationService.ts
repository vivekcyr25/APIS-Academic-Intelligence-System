import { collection, getDocs, doc, setDoc, writeBatch, query, where, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Subject } from '../../types/academic-v2';

export interface MigrationPreview {
  legacyMarksCount: number;
  legacyAttendanceCount: number;
  conflicts: string[];
  readyToMigrate: boolean;
  hasAlreadyMigrated: boolean;
}

export const analyzeLegacyData = async (userId: string): Promise<MigrationPreview> => {
  const marksSnap = await getDocs(collection(db, 'users', userId, 'marks'));
  const attSnap = await getDocs(collection(db, 'users', userId, 'attendance'));
  const subjectsSnap = await getDocs(collection(db, 'users', userId, 'subjects'));

  return {
    legacyMarksCount: marksSnap.size,
    legacyAttendanceCount: attSnap.size,
    conflicts: subjectsSnap.size > 0 && marksSnap.size > 0 ? ['Existing subjects found in new vault. Proceeding will merge or overwrite.'] : [],
    readyToMigrate: marksSnap.size > 0 || attSnap.size > 0,
    hasAlreadyMigrated: subjectsSnap.size > 0 && marksSnap.size === 0 && attSnap.size === 0
  };
};

export const executeMigration = async (userId: string, defaultSemesterId: string): Promise<void> => {
  const marksSnap = await getDocs(collection(db, 'users', userId, 'marks'));
  const attSnap = await getDocs(collection(db, 'users', userId, 'attendance'));
  
  if (marksSnap.empty && attSnap.empty) return;

  const batch = writeBatch(db);
  
  // Create subjects from marks
  const legacyMarks = marksSnap.docs.map(d => ({ id: d.id, ...d.data() as any }));
  const legacyAtt = attSnap.docs.map(d => ({ id: d.id, ...d.data() as any }));

  for (const mark of legacyMarks) {
    // Find matching attendance
    const matchingAtt = legacyAtt.find(a => a.subject === mark.subject);
    
    // Create new subject document
    const subjectRef = doc(collection(db, 'users', userId, 'subjects'));
    const newSubject: Omit<Subject, 'id'> = {
      userId,
      semesterId: defaultSemesterId,
      semesterNumber: 1, // Fallback
      code: mark.subject?.substring(0, 6).toUpperCase() || 'UNK101',
      name: mark.subject || 'Unknown Subject',
      subjectType: 'theory', // Fallback
      faculty: 'TBD',
      credits: 4, // Default fallback
      ca1: mark.ca1 || 0,
      ca2: mark.ca2 || 0,
      bestCA: Math.max(mark.ca1 || 0, mark.ca2 || 0),
      mte: mark.mte || 0,
      ete: mark.ete || 0,
      labMarks: 0,
      attendanceMarks: 0,
      assignmentScore: 0,
      total: mark.total || 0,
      grade: mark.grade || 'C',
      gradePoints: 0, // Should be calculated
      gpaContribution: 0,
      attendedLectures: matchingAtt?.attended || 0,
      totalLectures: matchingAtt?.total || 0,
      attendancePercentage: matchingAtt?.percentage || 0,
      priority: 'medium',
      shortageRisk: 'low',
      performanceRisk: 'low',
      source: 'manual'
    };
    
    batch.set(subjectRef, newSubject);
    
    // Archive the legacy doc
    const archiveRef = doc(db, 'users', userId, 'legacy_archive_marks', mark.id);
    batch.set(archiveRef, mark);
    batch.delete(doc(db, 'users', userId, 'marks', mark.id));
  }
  
  for (const att of legacyAtt) {
     const archiveRef = doc(db, 'users', userId, 'legacy_archive_attendance', att.id);
     batch.set(archiveRef, att);
     batch.delete(doc(db, 'users', userId, 'attendance', att.id));
  }

  await batch.commit();
};

export const rollbackMigration = async (userId: string): Promise<void> => {
  const archiveMarksSnap = await getDocs(collection(db, 'users', userId, 'legacy_archive_marks'));
  const archiveAttSnap = await getDocs(collection(db, 'users', userId, 'legacy_archive_attendance'));
  
  if (archiveMarksSnap.empty && archiveAttSnap.empty) return;

  const batch = writeBatch(db);
  
  for (const mark of archiveMarksSnap.docs) {
    batch.set(doc(db, 'users', userId, 'marks', mark.id), mark.data());
    batch.delete(mark.ref);
  }
  
  for (const att of archiveAttSnap.docs) {
    batch.set(doc(db, 'users', userId, 'attendance', att.id), att.data());
    batch.delete(att.ref);
  }
  
  // Optionally clear the new subjects if it was a pure migration
  // For safety, we might not delete subjects here to avoid data loss of newly added ones.
  // Or we could track `source: 'migration'` and delete only those.
  
  await batch.commit();
};
