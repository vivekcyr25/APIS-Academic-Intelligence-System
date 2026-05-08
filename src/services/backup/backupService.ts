import { db } from '../firebase/config';
import { 
  collection, 
  doc, 
  getDocs, 
  updateDoc, 
  serverTimestamp, 
  query, 
  where 
} from 'firebase/firestore';
import { downloadAcademicArchive } from '../export/exportService';
import { telemetryService, TELEMETRY_EVENTS } from '../telemetry/telemetryService';

/**
 * APIS AI Backup Service
 * Manages operational academic memory exports and Firestore synchronization.
 */

export const triggerAcademicBackup = async (userId: string) => {
  try {
    
    // 1. Gather all academic data points for full archive
    const semestersSnap = await getDocs(collection(db, 'users', userId, 'semesters'));
    const subjectsSnap = await getDocs(collection(db, 'users', userId, 'subjects'));
    const marksSnap = await getDocs(collection(db, 'users', userId, 'marks'));
    const profileSnap = await getDocs(collection(db, 'users', userId, 'profile'));
    
    const archiveData = {
      version: '1.2.0',
      timestamp: new Date().toISOString(),
      profile: profileSnap.docs.map(d => d.data()),
      semesters: semestersSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      subjects: subjectsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      marks: marksSnap.docs.map(d => ({ id: d.id, ...d.data() })),
    };

    // 2. Trigger real browser download
    downloadAcademicArchive(archiveData);

    // 3. Persist backup event to Firestore
    // We update the user document directly for global reactivity in AuthContext
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      lastBackupAt: serverTimestamp()
    });

    // 4. Log Operational Telemetry
    await telemetryService.logEvent(TELEMETRY_EVENTS.UX_INTERACTION, {
      action: 'backup_completed',
      dataPoints: archiveData.semesters.length + archiveData.subjects.length
    });

    return true;
  } catch (error) {
    
    await telemetryService.logEvent(TELEMETRY_EVENTS.ERROR, {
      action: 'backup_failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    throw error;
  }
};
