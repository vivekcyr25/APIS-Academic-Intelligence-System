import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext.tsx';
import { HeroSection } from '../components/onboarding/HeroSection.tsx';
import { AcademicSetup } from '../components/onboarding/AcademicSetup.tsx';
import { subscribeToAcademicProfile, getAcademicProfile } from '../services/academic/semesterService.ts';
import { subscribeToMarks, type MarkRecord } from '../services/marks/marksService.ts';
import { StatsCard, Card } from '../components/ui/Card.tsx';
import { 
  GraduationCap, 
  BookOpen, 
  Trophy, 
  Target,
  TrendingUp,
  BrainCircuit,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Clock,
  Loader2,
  CheckCircle2,
  RefreshCcw,
  ShieldCheck
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
import type { AcademicProfile } from '../types/academic-v2';
import { usePerformanceMode } from '../hooks/usePerformanceMode';

const Dashboard = () => {
  const { user } = useAuth();
  const { isLowEnd } = usePerformanceMode();
  const [profile, setProfile] = useState<AcademicProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);

  const [marks, setMarks] = useState<MarkRecord[]>([]);
  const [aiTip, setAiTip] = useState<string>('');
  const [tipLoading, setTipLoading] = useState(false);
  const navigate = useNavigate();

  // Legacy state
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [assignments, setAssignments] = useState<AssignmentRecord[]>([]);

  // 1. Profile Initialization & Onboarding Check
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToAcademicProfile(user.id, (data) => {
      setProfile(data);
      if (data && data.onboardingComplete) {
        setShowSetup(false);
      } else {
        setShowSetup(true);
      }
      setLoadingProfile(false);
    });
    return () => unsubscribe();
  }, [user]);

  // 2. Cinematic Verification Flow
  useEffect(() => {
    if (!loadingProfile && !showSetup) {
      // Small delay to show verification animation
      const timer = setTimeout(() => {
        setVerificationComplete(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [loadingProfile, showSetup]);

  // Legacy data fetches (will be migrated to SemesterVault later)
  useEffect(() => {
    if (!user || showSetup) return;
    const unsubscribe = subscribeToMarks(user.id, (data) => setMarks(data));
    return () => unsubscribe();
  }, [user, showSetup]);

  useEffect(() => {
    if (!user || showSetup) return;
    const q = query(collection(db, 'users', user.id, 'attendance'));
    return onSnapshot(q, (snapshot) => {
      setAttendance(snapshot.docs.map(doc => doc.data() as AttendanceRecord));
    });
  }, [user, showSetup]);

  useEffect(() => {
    if (!user || showSetup) return;
    const q = query(collection(db, 'users', user.id, 'assignment'), limit(5));
    return onSnapshot(q, (snapshot) => {
      setAssignments(snapshot.docs.map(doc => doc.data() as AssignmentRecord));
    });
  }, [user, showSetup]);

  // AI Tip Generation
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
    : 0;
  
  const pendingAssignments = assignments.filter(a => a.status === 'pending');

  const chartData = [
    { name: 'Week 1', gpa: 7.2 },
    { name: 'Week 2', gpa: 7.5 },
    { name: 'Week 3', gpa: 7.4 },
    { name: 'Week 4', gpa: 8.1 },
    { name: 'Current', gpa: gpa || 8.1 },
  ];

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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-5 rounded-2xl bg-violet-500/10 border border-violet-500/20 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <ShieldAlert className="w-16 h-16 text-violet-400" />
            </div>
            <h4 className="text-sm font-black text-violet-300 mb-1 flex items-center gap-2 text-hover-premium hover-active">
              <ShieldAlert className="w-4 h-4" /> Academic Safety Check
            </h4>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed font-bold">
              You haven't backed up your academic memory in {Math.round(daysSinceBackup) > 900 ? 'some time' : `${Math.round(daysSinceBackup)} days`}. Protecting your evolution is our priority.
            </p>
            <Button 
              onClick={handleBackup} 
              disabled={isBackingUp}
              className="w-full h-10 text-xs bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 border border-violet-500/30 flex items-center justify-center gap-2"
            >
              {isBackingUp ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
              {isBackingUp ? 'Securing Memory...' : 'Secure Backup Now'}
            </Button>
          </motion.div>
        ) : (
          <motion.div 
            key="secured"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <ShieldCheck className="w-16 h-16 text-emerald-400" />
            </div>
            <h4 className="text-sm font-black text-emerald-400 mb-1 flex items-center gap-2 text-hover-premium hover-success">
              <CheckCircle2 className="w-4 h-4" /> Academic Memory Secured
            </h4>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              Your academic evolution is synchronized and protected. Next safety check in {Math.round(30 - daysSinceBackup)} days.
            </p>
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-emerald-400/60">
              <span>Last Backup</span>
              <span>{backupSuccess ? 'Just now' : formatRelativeTime(lastBackupAt)}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // 1. Setup Wizard
  if (showSetup) {
    return <AcademicSetup onComplete={() => setShowSetup(false)} />;
  }

  // 2. Verification Animation
  if (!verificationComplete) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          className="text-center relative z-10"
        >
          <motion.div
            animate={{ 
              boxShadow: ["0 0 0 0 rgba(139, 92, 246, 0)", "0 0 0 40px rgba(139, 92, 246, 0)"]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-24 h-24 mx-auto rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center mb-6"
          >
            <BrainCircuit className="w-10 h-10 text-primary" />
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-black uppercase tracking-widest text-primary mb-2"
          >
            Identity Verified
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-muted-foreground font-medium"
          >
            Initializing Academic Intelligence Vault...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // 3. Main Dashboard with Cinematic Scroll Reveal
  return (
    <div className="relative gpu-accelerated" style={{ contain: 'paint' }}>
      {/* Scrollable Container */}
      <div className="space-y-10 relative z-10 pb-32">
        
        {/* Cinematic Hero */}
        <HeroSection />

        <div className="space-y-10 px-4 md:px-0">
          {/* Legacy Empty State Hook / Quick Start */}
          {marks.length === 0 && (
            <Card className="p-8 border-primary/20 bg-primary/5 text-center">
              <BrainCircuit className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Initialize Your Intelligence</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Your semester vault is empty. Upload your academic documents or enter data manually to activate the SGPA intelligence engine.
              </p>
              <Button onClick={() => navigate('/upload')} className="px-8 neural-glow">
                Initialize First Semester <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Card>
          )}

          {/* AI Synopsis */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none" style={{ opacity: 'calc(0.1 * var(--glow-opacity))' }}>
              <Sparkles className="w-32 h-32 text-primary animate-pulse" />
            </div>
            
            <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0 neural-glow border border-primary/30">
                <BrainCircuit className="w-8 h-8 text-primary" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-black tracking-tight text-hover-premium hover-active underline-reveal">Neural Synopsis</h2>
                  {tipLoading && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
                  {!tipLoading && <span className="px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] bg-primary/20 text-primary rounded-full">Live</span>}
                </div>
                
                <p className="text-muted-foreground text-lg leading-relaxed font-bold italic">
                  {aiTip || "Synthesizing academic patterns. Provide more data points for deeper insights."}
                </p>
              </div>

              {!isLowEnd && (
                <Button onClick={() => navigate('/ai')} className="shrink-0 h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                  Ask AI Assistant <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              )}
            </div>
          </Card>

          {/* KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard 
              label="Current SGPA" 
              value={gpa > 0 ? gpa.toFixed(2) : '—'}
              subtext={marks.length > 0 ? `Based on ${marks.length} evaluations` : 'Awaiting data'}
              icon={Trophy}
              color="primary"
            />
            <StatsCard 
              label="Credits Earned" 
              value="0"
              subtext="Legacy Migration Mode"
              icon={Target}
              color="secondary"
            />
            <StatsCard 
              label="Average Attendance" 
              value={`${overallAttendance.toFixed(1)}%`}
              subtext={overallAttendance < 75 ? 'Critical Warning' : 'Optimal'}
              icon={Clock}
              color={overallAttendance < 75 ? 'danger' : 'success'}
            />
            <StatsCard 
              label="Pending Intelligence" 
              value={pendingAssignments.length.toString()}
              subtext="Assignments & Tasks"
              icon={BookOpen}
              color="warning"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Trajectory */}
            <div className="lg:col-span-2">
              <Card className="h-full min-h-[400px] flex flex-col p-6">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-black tracking-tight mb-1 text-hover-premium hover-active underline-reveal">Performance Trajectory</h3>
                    <p className="text-sm text-muted-foreground font-black uppercase tracking-widest">Historical vectors and simulated projections</p>
                  </div>
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                
                <div className="flex-1 w-full h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
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
                          backgroundColor: 'rgba(0,0,0,0.8)', 
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                          backdropFilter: 'blur(var(--blur-md))',
                          WebkitBackdropFilter: 'blur(var(--blur-md))'
                        }}
                        itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="gpa" 
                        stroke="#8b5cf6" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorGpa)" 
                        isAnimationActive={!isLowEnd}
                        animationDuration={1500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* Smart Navigation Hub */}
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-card to-card/50">
                <div className="mb-6">
                  <h3 className="text-xl font-black tracking-tight mb-1 text-hover-premium hover-active underline-reveal">Command Center</h3>
                  <p className="text-sm text-muted-foreground font-black uppercase tracking-widest">Quick access modules</p>
                </div>
                
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-between h-14 bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                    onClick={() => navigate('/upload')}
                  >
                    <div className="flex items-center gap-3">
                      <GraduationCap className="w-5 h-5 text-primary" />
                      <span className="font-semibold">Upload Center</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-between h-14 bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                    onClick={() => navigate('/assignments')}
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-secondary" />
                      <span className="font-semibold">Assignments</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {pendingAssignments.length > 0 && (
                        <span className="bg-rose-500/20 text-rose-400 text-xs font-bold px-2 py-1 rounded-full">
                          {pendingAssignments.length}
                        </span>
                      )}
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="w-full justify-between h-14 bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                    onClick={() => navigate('/attendance')}
                  >
                    <div className="flex items-center gap-3">
                      <ShieldAlert className="w-5 h-5 text-amber-400" />
                      <span className="font-semibold">Attendance Vault</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              </Card>

              {/* Academic Health Snapshot — Backup Nudge & Secured State */}
              <AcademicHealthSnapshot />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
