import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToSemesters } from '../services/academic/semesterService';
import { calculateAcademicMemory } from '../services/academic/academicMemory';
import type { Semester, AcademicMemory } from '../types/academic-v2';
import { IntelligenceHero } from '../components/intelligence/IntelligenceHero';
import { EvolutionGraph } from '../components/intelligence/EvolutionGraph';
import { SemesterComparison } from '../components/intelligence/SemesterComparison';
import { BurnoutEngineView, SubjectWeaknessMemory } from '../components/intelligence/MemoryWidgets';
import { Button } from '../components/ui/Button';
import { BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardSkeleton } from '../components/ui/SkeletonLoader';
import { TRANSITIONS, ANIMATIONS } from '../lib/motion';
import { EmptyState } from '../components/ui/EmptyState';

const IntelligenceDashboard = () => {
  const { user } = useAuth();
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [memory, setMemory] = useState<AcademicMemory | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    
    const unsub = subscribeToSemesters(user.id, sems => {
      setSemesters(sems);
      
      // Calculate or fetch academic memory
      calculateAcademicMemory(user.id).then(mem => {
        setMemory(mem);
        setLoading(false);
      });
    });

    return () => unsub();
  }, [user]);

  if (loading) {
    return (
      <div className="pt-10">
        <DashboardSkeleton />
      </div>
    );
  }

  const validSems = semesters.filter(s => s.status === 'completed' || s.status === 'active' || s.status === 'archived');

  if (validSems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <EmptyState
          icon={BookOpen}
          title="No academic memory recorded yet"
          description="Academic intelligence builds longitudinal models from your completed terms. Add your current or past semesters in Semester Vault to unlock pattern recognition and workload tracking."
          hint="AI interpretation is only activated once real academic records are available."
          action={
            <Button onClick={() => navigate('/semester-vault')} className="h-11 px-6 rounded-xl font-bold">
              Initialize Semester Records
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 relative z-10 pb-28">
      
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2 border-b border-white/[0.08] pb-4">
        <div>
          <span className="font-condensed-heading text-xs font-bold text-primary tracking-widest block mb-1">
            LONGITUDINAL ANALYTICS
          </span>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-condensed-heading text-4xl sm:text-5xl font-black tracking-wide text-white">
              ACADEMIC INTELLIGENCE
            </h1>
            <span className="provenance-tag font-condensed">
              Verified Records
            </span>
          </div>
          <p className="font-condensed text-base text-muted-foreground tracking-wide font-medium">
            Longitudinal pattern detection and AI interpretation across your recorded academic history
          </p>
        </div>
      </header>

      {/* 1. Intelligence Hero */}
      <motion.div {...ANIMATIONS.SLIDE_UP}>
        <IntelligenceHero semesters={semesters} memory={memory} />
      </motion.div>

      {/* 2. Evolution Graph */}
      {validSems.length > 0 && (
        <motion.div 
          {...ANIMATIONS.SLIDE_UP} 
          transition={{ ...TRANSITIONS.DEFAULT, delay: TRANSITIONS.STAGGER }}
        >
          <EvolutionGraph semesters={semesters} />
        </motion.div>
      )}

      {/* Progressive Disclosure Toggle */}
      {validSems.length > 1 && !expanded && (
        <div className="flex justify-center pt-4">
          <Button 
            onClick={() => setExpanded(true)} 
            variant="outline" 
            className="h-10 px-5 text-xs font-semibold rounded-xl border-white/10 hover:border-white/20 text-white/80"
          >
            Show In-Depth Semester Comparisons & Workload Models
          </Button>
        </div>
      )}

      {/* Deep Analytics (Progressive Reveal) */}
      {expanded && validSems.length > 1 && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }} 
          animate={{ opacity: 1, height: 'auto' }} 
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4"
        >
          {/* 3. Semester Comparison */}
          <div className="col-span-1 lg:col-span-2">
            <SemesterComparison semesters={semesters} />
          </div>

          {/* 4. Subject Weaknesses */}
          <SubjectWeaknessMemory memory={memory} />

          {/* 5. Workload Signal */}
          <BurnoutEngineView memory={memory} />
          
        </motion.div>
      )}

    </div>
  );
};

export default IntelligenceDashboard;
