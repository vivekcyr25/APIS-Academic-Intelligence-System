import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { analyzeLegacyData, executeMigration, rollbackMigration, type MigrationPreview } from '../../services/academic/migrationService';
import { subscribeToSemesters } from '../../services/academic/semesterService';
import { Database, AlertTriangle, CheckCircle2, RotateCcw, ArrowRight } from 'lucide-react';
import type { Semester } from '../../types/academic-v2';

export const MigrationTool = () => {
  const { user } = useAuth();
  const [preview, setPreview] = useState<MigrationPreview | null>(null);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [migrating, setMigrating] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    analyzeLegacyData(user.id).then(data => {
      setPreview(data);
      setLoading(false);
    });

    const unsub = subscribeToSemesters(user.id, sems => {
      setSemesters(sems);
      if (sems.length > 0) setSelectedSemester(sems[0].id!);
    });

    return () => unsub();
  }, [user, success]);

  const handleMigrate = async () => {
    if (!user || !selectedSemester) return;
    setMigrating(true);
    try {
      await executeMigration(user.id, selectedSemester);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert('Migration failed.');
    } finally {
      setMigrating(false);
    }
  };

  const handleRollback = async () => {
    if (!user) return;
    if (!confirm('Are you sure you want to rollback to the legacy architecture?')) return;
    setMigrating(true);
    try {
      await rollbackMigration(user.id);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert('Rollback failed.');
    } finally {
      setMigrating(false);
    }
  };

  if (loading) return null;

  return (
    <Card className="p-6 border-primary/20 bg-black/40 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] pointer-events-none" />
      
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-primary/20 text-primary rounded-xl neural-glow">
          <Database className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-black">Legacy Data Migration</h3>
          <p className="text-sm text-muted-foreground">Upgrade old marks to the new Semester Vault schema</p>
        </div>
      </div>

      {!preview?.readyToMigrate && !preview?.hasAlreadyMigrated ? (
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3 text-muted-foreground">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <p className="font-medium">No legacy data found. You are running natively on the V2 architecture.</p>
        </div>
      ) : null}

      {preview?.readyToMigrate && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Legacy Marks</p>
              <p className="text-2xl font-black">{preview.legacyMarksCount}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Legacy Attendance</p>
              <p className="text-2xl font-black">{preview.legacyAttendanceCount}</p>
            </div>
          </div>

          {preview.conflicts.length > 0 && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-bold mb-1">Conflicts Detected</p>
                <ul className="list-disc pl-4 space-y-1">
                  {preview.conflicts.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-muted-foreground">Target Semester for Legacy Data</label>
            <select 
              value={selectedSemester}
              onChange={e => setSelectedSemester(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none"
            >
              {semesters.map(s => (
                <option key={s.id} value={s.id} className="bg-[#1a1a1a] text-white py-2">{s.label}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-4">
            <Button onClick={handleMigrate} disabled={migrating} className="flex-1 h-12 neural-glow group">
              {migrating ? 'Migrating...' : 'Execute Migration'}
              {!migrating && <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            Old data will be safely preserved in `legacy_archive` and can be rolled back at any time.
          </p>
        </div>
      )}

      {preview?.hasAlreadyMigrated && !preview?.readyToMigrate && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5" />
            <p className="font-bold">Migration completed successfully. Legacy data is archived.</p>
          </div>
          <Button onClick={handleRollback} disabled={migrating} variant="outline" className="w-full h-12 border-rose-500/30 hover:bg-rose-500/10 text-rose-400">
            <RotateCcw className="w-4 h-4 mr-2" /> Rollback to Legacy State
          </Button>
        </div>
      )}
    </Card>
  );
};
