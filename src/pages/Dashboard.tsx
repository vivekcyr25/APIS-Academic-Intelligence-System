import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext.tsx';
import { HeroSection } from '../components/onboarding/HeroSection.tsx';
import { AcademicSetup } from '../components/onboarding/AcademicSetup.tsx';
import { subscribeToAcademicProfile, subscribeToSemesters } from '../services/academic/semesterService.ts';
import { subscribeToMarks, type MarkRecord } from '../services/marks/marksService.ts';
import { Card } from '../components/ui/Card.tsx';
import { Badge } from '../components/ui/Badge.tsx';
import { ApisActionButton } from '../components/apis/ApisActionButton.tsx';
import { ApisSectionHeader } from '../components/apis/ApisSectionHeader.tsx';
import {
  GraduationCap,
  BookOpen,
  TrendingUp,
  BrainCircuit,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  RefreshCcw,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { triggerAcademicBackup } from '../services/backup/backupService';
import { formatRelativeTime } from '../utils/academicUtils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Button } from '../components/ui/Button.tsx';
import { useNavigate } from 'react-router-dom';
import { getDashboardSnapshot } from '../services/ai/aiService.ts';
import { calculateGPA } from '../utils/academicUtils.ts';
import { db } from '../services/firebase/config.ts';
import { collection, query, onSnapshot, limit } from 'firebase/firestore';
import type { AttendanceRecord, AssignmentRecord } from '../types/academic';
import type { AcademicProfile, Semester } from '../types/academic-v2';
import { usePerformanceMode } from '../hooks/usePerformanceMode';
import NeuralConsole from '../components/ai/NeuralConsole.tsx';
import { HowApisWorks } from '../components/dashboard/HowApisWorks.tsx';
import { AcademicSnapshot } from '../components/dashboard/AcademicSnapshot.tsx';
import { EmptyState } from '../components/ui/EmptyState.tsx';

const Dashboard = () => {
  const { user } = useAuth();
  const { isLowEnd } = usePerformanceMode();
  const [profile, setProfile] = useState<AcademicProfile | null>(null);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [showSetup, setShowSetup] = useState(false);

  const [marks, setMarks] = useState<MarkRecord[]>([]);
  const [aiTip, setAiTip] = useState<string>('');
  const [tipLoading, setTipLoading] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const navigate = useNavigate();

  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [assignments, setAssignments] = useState<AssignmentRecord[]>([]);

  // 1. Profile Initialization
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToAcademicProfile(user.id, (data) => {
      setProfile(data);
      if (data && data.onboardingComplete) {
        setShowSetup(false);
      } else if (data === null) {
        // First time user with no profile record
        setShowSetup(true);
      }
      setLoadingProfile(false);
    });
    return () => unsubscribe();
  }, [user]);

  // 2. Real Semester Data
  useEffect(() => {
    if (!user || showSetup) return;
    const unsubscribe = subscribeToSemesters(user.id, (sems) => {
      setSemesters(sems);
    });
    return () => unsubscribe();
  }, [user, showSetup]);

  // 3. Marks Data
  useEffect(() => {
    if (!user || showSetup) return;
    const unsubscribe = subscribeToMarks(user.id, (data) => setMarks(data));
    return () => unsubscribe();
  }, [user, showSetup]);

  // 4. Attendance
  useEffect(() => {
    if (!user || showSetup) return;
    const q = query(collection(db, 'users', user.id, 'attendance'));
    return onSnapshot(q, (snapshot) => {
      setAttendance(snapshot.docs.map(doc => doc.data() as AttendanceRecord));
    });
  }, [user, showSetup]);

  // 5. Assignments
  useEffect(() => {
    if (!user || showSetup) return;
    const q = query(collection(db, 'users', user.id, 'assignment'), limit(10));
    return onSnapshot(q, (snapshot) => {
      setAssignments(snapshot.docs.map(doc => doc.data() as AssignmentRecord));
    });
  }, [user, showSetup]);

  // AI Interpretation Generation
  useEffect(() => {
    const fetchSnapshot = async () => {
      if (!user || marks.length === 0 || showSetup) return;
      setTipLoading(true);
      try {
        const snapshot = await getDashboardSnapshot(marks);
        setAiTip(snapshot);
      } catch (error) {
        // Tip generation failed silently
      } finally {
        setTipLoading(false);
      }
    };
    fetchSnapshot();
  }, [user, marks.length, showSetup]);

  const gpa = calculateGPA(marks);
  const overallAttendance = attendance.length > 0
    ? attendance.reduce((acc, curr) => acc + curr.attendancePercentage, 0) / attendance.length
    : null;

  const pendingAssignments = assignments.filter(a => a.status === 'pending');

  // Compute total credits and CGPA across completed/active semesters
  const validSems = semesters
    .filter(s => s.status === 'completed' || s.status === 'active' || s.status === 'archived')
    .sort((a, b) => a.number - b.number);

  let totalCreditsEarned = 0;
  let totalRegisteredCredits = 0;
  let cumulativePoints = 0;

  validSems.forEach(s => {
    if (s.totalCredits > 0) {
      totalRegisteredCredits += s.totalCredits;
      totalCreditsEarned += s.earnedCredits || 0;
      cumulativePoints += (s.sgpa * s.totalCredits);
    }
  });

  const computedCGPA = totalRegisteredCredits > 0 ? cumulativePoints / totalRegisteredCredits : null;

  // Real Semester Evolution Chart Data
  const chartData = validSems
    .filter(s => s.sgpa > 0)
    .map(s => ({
      name: s.label || `Sem ${s.number}`,
      sgpa: s.sgpa,
      credits: s.earnedCredits,
    }));

  // ─── Backup Logic ──────────────────────────────────────────
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState(false);

  const handleBackup = async () => {
    if (!user) return;
    setIsBackingUp(true);
    try {
      await triggerAcademicBackup(user.id);
      setBackupSuccess(true);
      setTimeout(() => setBackupSuccess(false), 5000);
    } catch (error) {
      // Error handled by backupService telemetry
    } finally {
      setIsBackingUp(false);
    }
  };

  const AcademicHealthSnapshot = () => {
    const lastBackupAt = user?.lastBackupAt;
    const now = Date.now();
    const lastBackupDate = lastBackupAt?.toDate ? lastBackupAt.toDate() : new Date(lastBackupAt);
    const daysSinceBackup = lastBackupAt ? (now - lastBackupDate.getTime()) / (1000 * 60 * 60 * 24) : 999;
    const isRecentlyBackedUp = daysSinceBackup < 30 || backupSuccess;

    return (
      <AnimatePresence mode="wait">
        {!isRecentlyBackedUp ? (
          <motion.div
            key="nudge"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="p-5 rounded-2xl bg-card border border-white/[0.08] relative overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="w-4 h-4 text-violet-400" />
              <h4 className="text-xs font-black text-white/90 uppercase tracking-wider">
                Academic Memory Backup
              </h4>
            </div>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              Backup your academic records to preserve your longitudinal history and risk models.
            </p>
            <Button
              onClick={handleBackup}
              disabled={isBackingUp}
              className="w-full h-9 text-xs bg-white/[0.05] hover:bg-white/[0.1] text-white/80 border border-white/10 flex items-center justify-center gap-2"
            >
              {isBackingUp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCcw className="w-3.5 h-3.5" />}
              {isBackingUp ? 'Securing Records...' : 'Backup Records Now'}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="secured"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-5 rounded-2xl bg-card border border-emerald-500/20 relative overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                Academic Memory Synchronized
              </h4>
            </div>
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
              Your academic records are safely stored. Next scheduled check in {Math.max(1, Math.round(30 - daysSinceBackup))} days.
            </p>
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-emerald-400/60">
              <span>Last Snapshot</span>
              <span>{backupSuccess ? 'Just now' : formatRelativeTime(lastBackupAt)}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  if (loadingProfile) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-7 h-7 animate-spin text-primary" />
      </div>
    );
  }

  // Setup Wizard for new users
  if (showSetup) {
    return <AcademicSetup onComplete={() => setShowSetup(false)} />;
  }

  const hasAnyData = marks.length > 0 || validSems.length > 0 || attendance.length > 0;

  return (
    <div className="relative space-y-10 pb-24">
      {/* 1. Hero & Product Positioning */}
      <HeroSection hasData={hasAnyData} />

      {/* 2. How APIS Works (Core Architecture Flow) */}
      <HowApisWorks />

      {/* 3. Academic Snapshot (Real Metrics with Provenance) */}
      <AcademicSnapshot
        cgpa={computedCGPA}
        sgpa={gpa > 0 ? gpa : (validSems.length > 0 ? validSems[validSems.length - 1]?.sgpa : null)}
        attendancePercentage={overallAttendance}
        creditsEarned={totalCreditsEarned > 0 ? totalCreditsEarned : null}
        totalCredits={totalRegisteredCredits > 0 ? totalRegisteredCredits : null}
        marksCount={marks.length}
        attendanceCount={attendance.length}
        semestersCount={validSems.length}
      />

      {/* 4. AI Interpretation Section */}
      <Card className="relative overflow-hidden bg-card/75 border-white/[0.08]">
        <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0 text-violet-400">
            <Sparkles className="w-6 h-6" />
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-condensed-heading text-xs font-bold text-violet-400 tracking-widest uppercase">
                REASONING LAYER
              </span>
              <h3 className="font-condensed-heading text-xl sm:text-2xl font-bold text-white tracking-wide">
                ACADEMIC INTERPRETATION & CONTEXT
              </h3>
              {tipLoading && <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />}
              <span className="provenance-tag font-condensed">
                Derived from verified records
              </span>
            </div>

            <p className="font-condensed text-base sm:text-lg text-muted-foreground leading-relaxed font-medium tracking-wide">
              {aiTip || (
                marks.length > 0
                  ? "Analyzing your current mark distributions to highlight trends and workload patterns."
                  : "Add semester marks and attendance to generate contextual academic insights."
              )}
            </p>
          </div>

          {!isLowEnd && !showConsole && (
            <Button
              onClick={() => setShowConsole(true)}
              variant="outline"
              className="shrink-0 h-11 px-5 rounded-xl border-white/10 hover:border-white/20 font-condensed text-sm font-bold text-white/90 uppercase tracking-wider"
            >
              Ask Academic Assistant <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          )}
        </div>
      </Card>

      {showConsole && (
        <NeuralConsole isOpen={showConsole} onClose={() => setShowConsole(false)} />
      )}

      {/* 5. Trajectory & Command Center Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Academic History Graph */}
        <div className="lg:col-span-2">
          <Card className="h-full min-h-[380px] flex flex-col p-6 sm:p-7 border-white/[0.08]">
            <ApisSectionHeader
              title="ACADEMIC HISTORY"
              description="Longitudinal SGPA trend across completed semesters"
              titleClassName="font-condensed-heading text-xl sm:text-2xl font-bold tracking-wide text-white mb-1"
              descriptionClassName="font-condensed text-sm text-muted-foreground font-medium tracking-wide"
              className="mb-6"
              rightAction={
                <div className="p-2 bg-violet-500/10 rounded-lg text-violet-400 border border-violet-500/20">
                  <TrendingUp className="w-4 h-4" />
                </div>
              }
            />

            {chartData.length >= 2 ? (
              <div className="flex-1 w-full h-[260px] mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke="rgba(255,255,255,0.4)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis
                      stroke="rgba(255,255,255,0.4)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 10]}
                      dx={-10}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(10,10,18,0.95)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                        color: '#fff'
                      }}
                      itemStyle={{ color: '#a78bfa', fontWeight: 'bold' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="sgpa"
                      name="SGPA"
                      stroke="#8b5cf6"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorGpa)"
                      isAnimationActive={!isLowEnd}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState
                icon={TrendingUp}
                title="Academic history starts here"
                description={
                  chartData.length === 1
                    ? "You have 1 semester recorded. Add another semester to reveal your longitudinal trajectory."
                    : "No completed semester records found. Add your semester marks in Semester Vault to visualize your trajectory."
                }
                hint="APIS never fabricates historical points — trajectories require at least 2 real semesters."
                action={
                  <Button
                    onClick={() => navigate('/semester-vault')}
                    variant="outline"
                    className="h-9 text-xs rounded-xl border-white/10"
                  >
                    Go to Semester Vault <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                }
              />
            )}
          </Card>
        </div>

        {/* Quick Access / Workflows */}
        <div className="space-y-6">
          <Card className="bg-card/70 border-white/[0.08] p-6">
            <div className="mb-5">
              <h3 className="text-base font-bold text-white tracking-tight">Academic Modules</h3>
              <p className="text-xs text-muted-foreground">Jump directly to your active workspaces</p>
            </div>

            <div className="space-y-3">
              <ApisActionButton
                icon={GraduationCap}
                label="Semester Vault"
                iconClassName="text-violet-400"
                onClick={() => navigate('/semester-vault')}
              />

              <ApisActionButton
                icon={BookOpen}
                label="Assignments & Tasks"
                iconClassName="text-indigo-400"
                onClick={() => navigate('/assignments')}
                badge={pendingAssignments.length > 0 && (
                  <Badge variant="destructive">
                    {pendingAssignments.length}
                  </Badge>
                )}
              />

              <ApisActionButton
                icon={Calendar}
                label="Attendance Vault"
                iconClassName="text-emerald-400"
                onClick={() => navigate('/attendance')}
              />
            </div>
          </Card>

          {/* Academic Memory Backup Status */}
          <AcademicHealthSnapshot />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
