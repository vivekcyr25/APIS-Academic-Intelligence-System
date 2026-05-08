import { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  subscribeToSemesters, 
  subscribeToSubjects,
  getAcademicProfile 
} from '../services/academic/semesterService';
import type { Semester, Subject, AcademicProfile } from '../types/academic-v2';
import { Card, StatsCard } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { DashboardSkeleton } from '../components/ui/SkeletonLoader';
import { 
  Plus, 
  GraduationCap, 
  ChevronDown, 
  ChevronUp,
  BrainCircuit,
  AlertTriangle,
  Clock,
  Target,
  Trophy,
  History,
  AlertCircle,
  MoreVertical,
  Archive,
  CheckCircle2,
  Lock,
  RotateCcw,
  Sparkles,
  Download
} from 'lucide-react';
import { exportSemesterToPDF } from '../services/export/exportService';
import { getGradePoints } from '../services/academic/academicEngine';
import { updateSemester } from '../services/academic/semesterService';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { SemesterTimeline } from '../components/academic/SemesterTimeline';
import { MigrationTool } from '../components/settings/MigrationTool';
import { SemesterCelebration } from '../components/academic/SemesterCelebration';
import { StatusLabel } from '../components/ui/StatusLabel';
import { FeedbackModal } from '../components/ui/FeedbackModal';
import { MessageSquare } from 'lucide-react';
import { usePerformanceMode } from '../hooks/usePerformanceMode';

const SubjectCard = memo(({ subject }: { subject: Subject }) => (
  <div className="p-4 rounded-xl bg-card border border-white/5 hover:border-white/10 transition-colors group">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">
          {subject.code} • {subject.subjectType}
        </p>
        <h5 className="font-bold text-lg leading-tight line-clamp-1">{subject.name}</h5>
      </div>
      <div className="px-2 py-1 rounded bg-white/5 text-xs font-bold border border-white/10">
        {subject.credits} CR
      </div>
    </div>
    
    <div className="grid grid-cols-3 gap-2 text-center mb-4">
      <div className="p-2 rounded-lg bg-white/5">
        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Score</p>
        <p className="font-black text-sm">{subject.total}</p>
      </div>
      <div className="p-2 rounded-lg bg-white/5">
        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Grade</p>
        <p className={cn(
          "font-black text-sm",
          subject.grade === 'F' ? "text-rose-400" : "text-primary"
        )}>{subject.grade || '—'}</p>
      </div>
      <div className="p-2 rounded-lg bg-white/5">
        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Att.</p>
        <p className={cn(
          "font-black text-sm",
          subject.attendancePercentage < 75 ? "text-amber-400" : "text-white"
        )}>{subject.attendancePercentage}%</p>
      </div>
    </div>

    {/* AI Risk Indicator */}
    {subject.priority === 'high' && subject.total < 50 && (
      <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 font-medium">
        <AlertTriangle className="w-3.5 h-3.5" /> High-credit performance risk
      </div>
    )}
  </div>
));

const SemesterVault = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<AcademicProfile | null>(null);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [subjectsBySem, setSubjectsBySem] = useState<Record<string, Subject[]>>({});
  const [expandedSems, setExpandedSems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [celebratingSem, setCelebratingSem] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'success' | 'sync' | 'waiting' | null>(null);
  const navigate = useNavigate();
  const { isLowEnd } = usePerformanceMode();

  // Initialize data
  useEffect(() => {
    if (!user) return;
    
    // Load profile
    getAcademicProfile(user.id).then(p => setProfile(p));

    // Load semesters
    const unsubSems = subscribeToSemesters(user.id, (sems) => {
      setSemesters(sems);
      setSyncStatus('sync');
      setTimeout(() => setSyncStatus('success'), 1200);
      setTimeout(() => setSyncStatus(null), 3500);
      
      // Auto-expand current active semester
      const activeSem = sems.find(s => s.status === 'active');
      if (activeSem) {
        setExpandedSems(prev => new Set(prev).add(activeSem.id!));
      }
      
      // Set up subject listeners for each semester
      const unsubSubs: (() => void)[] = [];
      sems.forEach(sem => {
        if (!sem.id) return;
        const unsub = subscribeToSubjects(user.id, (subs) => {
          setSubjectsBySem(prev => ({ ...prev, [sem.id!]: subs }));
        }, sem.id);
        unsubSubs.push(unsub);
      });
      
      setLoading(false);
      return () => unsubSubs.forEach(u => u());
    });
    
    return () => unsubSems();
  }, [user]);

  const toggleExpand = (semId: string) => {
    setExpandedSems(prev => {
      const next = new Set(prev);
      if (next.has(semId)) next.delete(semId);
      else next.add(semId);
      return next;
    });
  };

  const handleStatusChange = async (semesterId: string, newStatus: Semester['status'], e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (!user) return;
    
    if (newStatus === 'completed') {
      setCelebratingSem(semesterId);
      // Wait for celebration to finish before updating UI
    } else {
      await updateSemester(user.id, semesterId, { status: newStatus });
      if (newStatus === 'archived') {
        setExpandedSems(prev => {
          const next = new Set(prev);
          next.delete(semesterId);
          return next;
        });
      }
    }
  };

  const finishCelebration = async (semesterId: string) => {
    if (!user) return;
    await updateSemester(user.id, semesterId, { status: 'completed' });
    setCelebratingSem(null);
    setExpandedSems(prev => {
      const next = new Set(prev);
      next.delete(semesterId);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="pt-10">
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-10 relative z-10 pb-32 gpu-accelerated" style={{ contain: 'paint' }}>
      
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-4 mb-3">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest border border-primary/20"
            >
              <GraduationCap className="w-4 h-4" />
              {profile?.programName || 'Academic Vault'}
            </motion.div>
            <StatusLabel show={!!syncStatus} label={syncStatus === 'sync' ? 'Syncing Memory' : 'Synced to Vault'} type={syncStatus as any} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black font-heading tracking-tight mb-2 gradient-title">Semester Vault</h1>
          <p className="text-muted-foreground font-medium text-lg">Your adaptive long-term academic intelligence timeline.</p>
        </div>
        
        <Button className="h-12 px-6 rounded-2xl neural-glow shadow-[0_0_20px_rgba(139,92,246,0.2)]">
          <History className="w-5 h-5 mr-2" /> Combine Analytics
        </Button>
      </header>

      {celebratingSem && (
        <SemesterCelebration 
          isActive={true} 
          onComplete={() => finishCelebration(celebratingSem)} 
        />
      )}

      {/* Main Semester List */}
      <div className="space-y-6">
        {semesters.filter(s => s.status !== 'archived').map((sem, idx) => {
          const isExpanded = expandedSems.has(sem.id!);
          const subjects = subjectsBySem[sem.id!] || [];
          const hasSubjects = subjects.length > 0;
          
          return (
            <motion.div
              key={sem.id}
              initial={!isLowEnd ? { opacity: 0, y: 20 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: isLowEnd ? 0 : idx * 0.1 }}
            >
              <Card className={cn(
                "overflow-hidden transition-all duration-300",
                sem.status === 'active' && "border-primary/30 shadow-[0_0_30px_rgba(139,92,246,0.1)] bg-card",
                sem.status === 'completed' && "border-emerald-500/20 shadow-[0_0_20px_rgba(52,211,153,0.05)] bg-card",
                sem.status === 'upcoming' && "border-white/5 bg-black/60 opacity-80 border-dashed",
                !['active', 'completed', 'upcoming'].includes(sem.status) && "border-white/5 bg-black/40",
                isExpanded ? "ring-1 ring-white/10" : "hover:border-white/20"
              )}>
                {/* Semester Header Toggle */}
                <div 
                  onClick={() => toggleExpand(sem.id!)}
                  className="p-6 flex items-center justify-between cursor-pointer group select-none relative"
                >
                  <div className="flex items-center gap-6">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-all",
                      sem.status === 'active' && "bg-primary/20 text-primary border-primary/30 neural-glow animate-pulse-slow",
                      sem.status === 'completed' && "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
                      sem.status === 'upcoming' && "bg-white/5 text-muted-foreground border-white/10 group-hover:bg-white/10"
                    )}>
                      {sem.status === 'completed' ? <CheckCircle2 className="w-6 h-6" /> :
                       sem.status === 'upcoming' ? <Lock className="w-6 h-6" /> :
                       <span className="text-2xl font-black">{sem.number}</span>}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className={cn(
                          "text-xl font-black tracking-tight gradient-text-hover",
                          sem.status === 'active' && "hover-gradient-primary",
                          sem.status === 'completed' && "hover-gradient-emerald",
                          sem.status === 'upcoming' && "hover-gradient-muted"
                        )}>{sem.label}</h3>
                        {sem.status === 'active' && (
                          <span className="px-2 py-0.5 rounded-md bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            Active
                          </span>
                        )}
                        {sem.status === 'completed' && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Completed
                          </span>
                        )}
                        {sem.status === 'upcoming' && (
                          <span className="px-2 py-0.5 rounded-md bg-white/10 text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
                            Upcoming
                          </span>
                        )}
                      </div>
                      
                      {/* Mini Stats Bar */}
                      {hasSubjects ? (
                        <div className="flex items-center gap-4 text-sm text-muted-foreground font-medium mt-2">
                          <span className="flex items-center gap-1"><Trophy className="w-3.5 h-3.5 text-primary" /> {sem.sgpa.toFixed(2)} SGPA</span>
                          <span className="w-1 h-1 rounded-full bg-white/20" />
                          <span className="flex items-center gap-1"><Target className="w-3.5 h-3.5 text-secondary" /> {sem.earnedCredits}/{sem.totalCredits} Credits</span>
                          <span className="w-1 h-1 rounded-full bg-white/20" />
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-amber-400" /> {sem.avgAttendance.toFixed(1)}% Att.</span>
                        </div>
                      ) : (
                        <p className="text-sm text-primary/80 font-medium mt-2 flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5" /> Ready for Intelligence. Expand to initialize.
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-white" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                    </div>
                    {/* Context Menu (Click stops propagation) */}
                    <div className="relative" onClick={e => e.stopPropagation()}>
                      <div className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer group/menu">
                        <MoreVertical className="w-5 h-5 text-muted-foreground group-hover/menu:text-white" />
                        <div className="absolute right-0 top-12 w-48 bg-card border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-50 p-2 pointer-events-none group-hover/menu:pointer-events-auto origin-top-right">
                          <button onClick={(e) => handleStatusChange(sem.id!, 'completed', e)} className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-white/5 text-emerald-400">Mark as Complete</button>
                          <button onClick={(e) => handleStatusChange(sem.id!, 'active', e)} className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-white/5 text-primary">Set as Active</button>
                          <div className="h-[1px] bg-white/5 my-1" />
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              exportSemesterToPDF(sem, subjectsBySem[sem.id!] || [], user?.name || 'Academic User');
                              // Subtle nudge after export
                              setTimeout(() => setShowFeedbackModal(true), 2000);
                            }} 
                            className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-white/5 text-white flex items-center gap-2"
                          >
                            <Download className="w-4 h-4" /> Export Summary
                          </button>
                          <button onClick={(e) => handleStatusChange(sem.id!, 'archived', e)} className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-white/5 text-muted-foreground">Archive Semester</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expandable Content Area */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={!isLowEnd ? { height: 0, opacity: 0 } : { height: 'auto', opacity: 1 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={!isLowEnd ? { height: 0, opacity: 0 } : { height: 0, opacity: 0 }}
                      className="border-t border-white/5 bg-black/20"
                    >
                      <div className="p-6 space-y-6">
                        
                        {/* Contextual Primary Action Button */}
                        <div className="flex justify-end">
                          {sem.status === 'active' && (
                            <Button onClick={(e) => handleStatusChange(sem.id!, 'completed', e as any)} className="h-9 px-6 neural-glow text-xs">
                              <CheckCircle2 className="w-4 h-4 mr-2" /> Mark Complete
                            </Button>
                          )}
                          {sem.status === 'upcoming' && (
                            <Button onClick={(e) => handleStatusChange(sem.id!, 'active', e as any)} className="h-9 px-6 bg-white/10 hover:bg-white/20 text-xs">
                              Activate Semester
                            </Button>
                          )}
                          {sem.status === 'archived' && (
                            <Button onClick={(e) => handleStatusChange(sem.id!, 'completed', e as any)} className="h-9 px-6 bg-white/10 hover:bg-white/20 text-xs text-muted-foreground">
                              <RotateCcw className="w-4 h-4 mr-2" /> Restore
                            </Button>
                          )}
                        </div>

                        {/* Timeline Intelligence Layer */}
                        <SemesterTimeline semesterId={sem.id!} />
                        
                        {/* Empty State / Guided Onboarding for this Semester */}
                        {!hasSubjects ? (
                          <div className="p-8 rounded-2xl border border-dashed border-white/10 text-center bg-white/5">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4 neural-glow">
                              <BrainCircuit className="w-8 h-8 text-primary" />
                            </div>
                            <h4 className="text-lg font-bold mb-2">Activate Academic Memory</h4>
                            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                              Add your first high-credit subject to unlock SGPA projections and workload tracking. Academic memory becomes richer as semesters evolve.
                            </p>
                            <Button onClick={() => navigate('/upload')} className="h-10 px-6 neural-glow">
                              <Plus className="w-4 h-4 mr-2" /> Add First Subject
                            </Button>
                          </div>
                        ) : (
                          <>
                            {/* Subject Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {subjects.map(subject => (
                                <SubjectCard key={subject.id} subject={subject} />
                              ))}
                              
                              {/* Add Subject Card */}
                              <div 
                                onClick={() => navigate('/upload')}
                                className="p-4 rounded-xl bg-white/2 border border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 hover:border-primary/50 transition-all text-muted-foreground hover:text-white min-h-[160px]"
                              >
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-2">
                                  <Plus className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-sm">Add Subject</span>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Archived Semesters Section */}
      {semesters.filter(s => s.status === 'archived').length > 0 && (
        <div className="mt-12">
          <div 
            onClick={() => setShowArchived(!showArchived)}
            className="flex items-center gap-3 cursor-pointer group opacity-60 hover:opacity-100 transition-opacity mb-6"
          >
            <Archive className="w-5 h-5" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground group-hover:text-white">Archived Academic History</h3>
            <div className="h-[1px] flex-1 bg-white/10 group-hover:bg-white/20 transition-colors" />
            {showArchived ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>

          <AnimatePresence>
            {showArchived && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-4"
              >
                {semesters.filter(s => s.status === 'archived').map((sem) => (
                  <Card key={sem.id} className="p-4 border-white/5 bg-black/40 grayscale opacity-80 hover:opacity-100 hover:grayscale-0 transition-all flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                        <span className="font-bold">{sem.number}</span>
                      </div>
                      <div>
                        <h4 className="font-bold gradient-text-hover hover-gradient-muted">{sem.label}</h4>
                        <p className="text-xs text-muted-foreground">{sem.totalCredits} Credits • {sem.sgpa.toFixed(2)} SGPA</p>
                      </div>
                    </div>
                    <Button onClick={(e) => handleStatusChange(sem.id!, 'completed', e as any)} variant="outline" className="h-8 px-4 text-xs">
                      Restore
                    </Button>
                  </Card>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
      
      {/* Legacy Data Migration Utility */}
      <div className="mt-12">
        <MigrationTool />
      </div>

      <FeedbackModal 
        isOpen={showFeedbackModal} 
        onClose={() => setShowFeedbackModal(false)} 
        defaultCategory="general"
      />
    </div>
  );
};

export default SemesterVault;
