import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  ShieldAlert,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Upload,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, StatsCard } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/SkeletonLoader';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase/config';
import { collection, query, onSnapshot } from 'firebase/firestore';
import type { AttendanceRecord } from '../types/academic';
import { cn } from '../lib/utils';

const Attendance = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const q = query(collection(db, 'users', user.id, 'attendance'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as AttendanceRecord[];
        setRecords(data);
        setLoading(false);
      },
      () => {
        setError('Could not load attendance records. Check your connection and try again.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const hasData = records.length > 0;
  const overallAttendance = hasData
    ? records.reduce((acc, curr) => acc + curr.attendancePercentage, 0) / records.length
    : 0;
  const lowAttendanceCount = records.filter((r) => r.attendancePercentage < 75).length;
  const atRiskSubject = records.find((r) => r.attendancePercentage < 75);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Presence"
        title="Attendance"
        description="Track subject-level attendance and shortage risk from your uploaded records."
        actions={
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border/60 bg-muted/30 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 text-primary shrink-0" aria-hidden />
            <span>
              {loading ? 'Loading…' : hasData ? `${records.length} courses tracked` : 'No records yet'}
            </span>
          </div>
        }
      />

      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          label="Average attendance"
          value={`${overallAttendance.toFixed(1)}%`}
          icon={TrendingUp}
          color={hasData ? (overallAttendance >= 75 ? 'success' : 'danger') : 'primary'}
          loading={loading || !hasData}
        />
        <StatsCard
          label="Subjects at risk"
          value={lowAttendanceCount}
          icon={ShieldAlert}
          color={hasData ? (lowAttendanceCount > 0 ? 'danger' : 'success') : 'primary'}
          loading={loading || !hasData}
        />
        <StatsCard
          label="Minimum required"
          value="75%"
          icon={ShieldCheck}
          color="primary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-6 sm:p-8">
            <h2 className="text-lg font-semibold mb-6">By subject</h2>

            {loading ? (
              <div className="space-y-4" aria-busy="true" aria-label="Loading attendance">
                <Skeleton className="h-24 w-full rounded-2xl" />
                <Skeleton className="h-24 w-full rounded-2xl" />
                <Skeleton className="h-24 w-full rounded-2xl" />
              </div>
            ) : hasData ? (
              <div className="space-y-3">
                {records.map((record) => {
                  const safe = record.attendancePercentage >= 75;
                  const optimized = record.attendancePercentage >= 85;
                  const riskLabel = optimized ? 'Optimized' : safe ? 'Safe' : 'Critical';
                  return (
                    <div
                      key={record.id}
                      className="p-4 sm:p-5 rounded-2xl bg-muted/30 border border-border/50"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                          <div
                            className={cn(
                              'w-12 h-12 rounded-xl flex items-center justify-center font-bold tabular-nums shrink-0',
                              safe
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-rose-500/10 text-rose-400'
                            )}
                            aria-label={`${record.attendancePercentage.toFixed(0)} percent`}
                          >
                            {record.attendancePercentage.toFixed(0)}%
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold truncate">{record.subjectName}</h3>
                            <p className="text-xs text-muted-foreground">
                              Updated{' '}
                              {record.updatedAt?.toDate?.().toLocaleDateString() || 'recently'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 sm:gap-6">
                          <div className="text-right">
                            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
                              Risk
                            </p>
                            <span
                              className={cn(
                                'text-xs font-semibold',
                                optimized
                                  ? 'text-emerald-400'
                                  : safe
                                    ? 'text-amber-400'
                                    : 'text-rose-400'
                              )}
                            >
                              {riskLabel}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
                              Status
                            </p>
                            <span className="text-sm font-medium">
                              {safe ? 'Above 75%' : 'Below 75%'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div
                        className="mt-4 h-1.5 w-full bg-muted rounded-full overflow-hidden"
                        role="progressbar"
                        aria-valuenow={Math.round(record.attendancePercentage)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${record.subjectName} attendance`}
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(record.attendancePercentage, 100)}%` }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                          className={cn(
                            'h-full rounded-full',
                            safe ? 'bg-primary' : 'bg-rose-500'
                          )}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={Calendar}
                title="No attendance data yet"
                description="Upload your attendance sheet from the Upload Center. Once imported, subject-level percentages and shortage risk will appear here."
                action={
                  <Link to="/upload">
                    <Button className="gap-2">
                      <Upload className="w-4 h-4" aria-hidden /> Go to Upload
                    </Button>
                  </Link>
                }
              />
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" aria-hidden />
              Guidance
            </h2>
            {loading ? (
              <Skeleton className="h-24 w-full rounded-2xl" />
            ) : !hasData ? (
              <p className="text-sm text-muted-foreground leading-relaxed">
                Insights appear after attendance records are uploaded. Most universities require at
                least 75% attendance per subject.
              </p>
            ) : lowAttendanceCount > 0 ? (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {lowAttendanceCount} subject{lowAttendanceCount === 1 ? '' : 's'} below 75%
                {atRiskSubject ? `, including ${atRiskSubject.subjectName}` : ''}. Prioritize those
                classes until you clear the threshold — exact lectures needed depend on remaining
                sessions in your timetable.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed">
                All tracked subjects are at or above 75%. Keep the current attendance rhythm.
              </p>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-sm font-semibold mb-4">Threshold legend</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Optimized</dt>
                <dd className="text-emerald-400 font-medium">85–100%</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Safe</dt>
                <dd className="text-primary font-medium">75–84%</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Critical</dt>
                <dd className="text-rose-400 font-medium">&lt; 75%</dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
