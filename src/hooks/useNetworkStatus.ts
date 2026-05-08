import { useState, useEffect } from 'react';
import { onSnapshotsInSync } from 'firebase/firestore';
import { db } from '../services/firebase/config';

export type SyncState = 'synced' | 'offline' | 'reconnecting' | 'pending';

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncState, setSyncState] = useState<SyncState>('synced');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(new Date());

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncState('reconnecting');
    };
    const handleOffline = () => {
      setIsOnline(false);
      setSyncState('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for Firestore sync events
    const unsubscribeSync = onSnapshotsInSync(db, () => {
      if (navigator.onLine) {
        setSyncState('synced');
        setLastSyncedAt(new Date());
      }
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribeSync();
    };
  }, []);

  return { isOnline, syncState, lastSyncedAt, setSyncState };
};
