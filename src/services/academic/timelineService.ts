import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, getDocs, serverTimestamp,
  where
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { TimelineEvent } from '../../types/academic-v2';

export const addTimelineEvent = async (
  userId: string,
  event: Omit<TimelineEvent, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const result = await addDoc(collection(db, 'users', userId, 'timeline'), {
    ...event,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return result.id;
};

export const updateTimelineEvent = async (
  userId: string,
  eventId: string,
  data: Partial<TimelineEvent>
): Promise<void> => {
  const ref = doc(db, 'users', userId, 'timeline', eventId);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
};

export const deleteTimelineEvent = async (userId: string, eventId: string): Promise<void> => {
  await deleteDoc(doc(db, 'users', userId, 'timeline', eventId));
};

export const subscribeToTimeline = (
  userId: string,
  semesterId: string,
  callback: (events: TimelineEvent[]) => void
) => {
  const q = query(
    collection(db, 'users', userId, 'timeline'),
    where('semesterId', '==', semesterId),
    orderBy('startDate', 'asc')
  );
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as TimelineEvent)));
  });
};

export const getSemesterTimeline = async (
  userId: string,
  semesterId: string
): Promise<TimelineEvent[]> => {
  const q = query(
    collection(db, 'users', userId, 'timeline'),
    where('semesterId', '==', semesterId),
    orderBy('startDate', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as TimelineEvent));
};
