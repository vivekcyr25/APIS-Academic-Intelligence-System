import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { StatusLabel } from '../ui/StatusLabel';

export const SyncStatusIndicator = () => {
  const { isOnline, syncState, lastSyncedAt } = useNetworkStatus();

  return (
    <div className="fixed bottom-24 right-6 z-[60] md:bottom-12 md:right-12 flex flex-col items-end gap-2">
      {!isOnline && (
        <StatusLabel 
          show={true} 
          label="Offline Mode" 
          type="offline" 
        />
      )}
      {isOnline && syncState === 'reconnecting' && (
        <StatusLabel 
          show={true} 
          label="Reconnecting" 
          type="reconnecting" 
        />
      )}
      {isOnline && syncState === 'synced' && (
        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity flex items-center gap-1.5">
          <div className="w-1 h-1 rounded-full bg-emerald-500" />
          Last Synced: {lastSyncedAt?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      )}
    </div>
  );
};
