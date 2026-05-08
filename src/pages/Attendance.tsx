import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Calendar, 
  TrendingUp, 
  AlertTriangle,
  BrainCircuit,
  Info
} from 'lucide-react';
import { Card, StatsCard } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import type { AttendanceRecord } from '../types/academic';
import { cn } from '../lib/utils';

const Attendance = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'users', user.id, 'attendance')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AttendanceRecord[];
      setRecords(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const overallAttendance = records.length > 0
    ? records.reduce((acc, curr) => acc + curr.attendancePercentage, 0) / records.length
    : 0;

  const lowAttendanceCount = records.filter(r => r.attendancePercentage < 75).length;

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black font-heading tracking-tight mb-2">Attendance Analytics</h1>
          <p className="text-muted-foreground font-medium">Real-time tracking and shortage risk detection</p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
          <Calendar className="w-5 h-5 text-primary" />
          <span className="text-sm font-black uppercase tracking-wider">Semester Fall 2026</span>
        </div>
      </header>

      {/* KPI Overlays */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard 
          label="Cumulative Attendance" 
          value={`${overallAttendance.toFixed(1)}%`}
          icon={TrendingUp}
          color={overallAttendance >= 75 ? 'success' : 'danger'}
        />
        <StatsCard 
          label="Subjects at Risk" 
          value={lowAttendanceCount}
          icon={ShieldAlert}
          color={lowAttendanceCount > 0 ? 'danger' : 'success'}
        />
        <StatsCard 
          label="Minimum Required" 
          value="75%"
          icon={ShieldCheck}
          color="primary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Subject Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h3 className="text-xl font-black mb-6 flex items-center gap-2">
              Subject Vector Analysis
            </h3>
            <div className="space-y-4">
              {records.length > 0 ? records.map((record) => (
                <div key={record.id} className="p-6 rounded-2xl bg-white/3 border border-white/5 hover:bg-white/5 transition-all group">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center font-black shadow-lg",
                        record.attendancePercentage >= 75 ? "bg-green-500/10 text-green-400" : "bg-rose-500/10 text-rose-400"
                      )}>
                        {record.attendancePercentage.toFixed(0)}%
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">{record.subjectName}</h4>
                        <p className="text-xs text-muted-foreground">Updated {record.updatedAt?.toDate?.().toLocaleDateString() || 'Recently'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="hidden md:block">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 text-right">Shortage Risk</p>
                        <div className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-right",
                          record.attendancePercentage >= 85 ? "bg-green-500/10 text-green-400" :
                          record.attendancePercentage >= 75 ? "bg-amber-500/10 text-amber-400" :
                          "bg-rose-500/10 text-rose-400"
                        )}>
                          {record.attendancePercentage >= 85 ? 'Optimized' : record.attendancePercentage >= 75 ? 'Fair' : 'CRITICAL'}
                        </div>
                      </div>
                      <div className="h-10 w-[2px] bg-white/5 hidden md:block" />
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Status</p>
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            record.attendancePercentage >= 75 ? "bg-green-500" : "bg-rose-500 animate-pulse"
                          )} />
                          <span className="text-sm font-bold">{record.attendancePercentage >= 75 ? 'Safe' : 'Shortage'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-6 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${record.attendancePercentage}%` }}
                      className={cn(
                        "h-full rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]",
                        record.attendancePercentage >= 75 ? "bg-primary" : "bg-rose-500"
                      )}
                    />
                  </div>
                </div>
              )) : (
                <div className="py-20 text-center space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mx-auto text-muted-foreground">
                    <Info className="w-8 h-8" />
                  </div>
                  <p className="text-sm text-muted-foreground">No attendance records found. Use the Upload Center to import your data.</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* AI Insight Sidebar */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary text-white rounded-lg neural-glow">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-black font-heading tracking-tight">AI Strategy</h3>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-black uppercase tracking-widest text-amber-400">Recovery Plan</span>
                </div>
                <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                  {lowAttendanceCount > 0 
                    ? `You need to attend the next 4 lectures of ${records.find(r => r.attendancePercentage < 75)?.subjectName} to reach 75%.`
                    : "Your attendance vectors are stable. Maintain the current rhythm to optimize performance."}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <p className="text-xs font-black text-primary uppercase tracking-widest mb-2">Optimization Tip</p>
                <p className="text-sm font-medium text-muted-foreground leading-relaxed italic">
                  "Students with &gt;85% attendance typically score 1.2 points higher in ETE exams."
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <h4 className="font-bold mb-4">Legend</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Optimized</span>
                <span className="text-green-400 font-bold">85% - 100%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Safe</span>
                <span className="text-primary font-bold">75% - 85%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Critical</span>
                <span className="text-rose-400 font-bold">&lt; 75%</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
