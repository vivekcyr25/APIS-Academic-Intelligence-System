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
import { BrainCircuit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardSkeleton } from '../components/ui/SkeletonLoader';
import { TRANSITIONS, ANIMATIONS } from '../lib/motion';

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
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center neural-glow">
          <BrainCircuit className="w-10 h-10 text-primary" />
        </div>
        <div className="max-w-md">
          <h2 className="text-2xl font-black gradient-title mb-2">Build Your Academic Memory</h2>
          <p className="text-muted-foreground">
            Academic intelligence evolves as you progress. Initialize your first active semester and add a high-credit subject to unlock SGPA projections and workload tracking.
          </p>
        </div>
        <Button onClick={() => navigate('/semester-vault')} className="h-12 px-8 neural-glow rounded-2xl">
          Initialize Vault
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-10 relative z-10 pb-32">
      
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-black font-heading tracking-tight mb-2 gradient-title">Academic Evolution</h1>
          <p className="text-muted-foreground font-medium text-lg">Your longitudinal intelligence and memory dashboard.</p>
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
        <div className="flex justify-center mt-8">
          <Button onClick={() => setExpanded(true)} variant="outline" className="neural-hover border-white/10 hover:border-white/20">
            Expand Deep Analytics
          </Button>
        </div>
      )}

      {/* Deep Analytics (Progressive Reveal) */}
      {expanded && validSems.length > 1 && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }} 
          animate={{ opacity: 1, height: 'auto' }} 
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8"
        >
          {/* 3. Semester Comparison */}
          <div className="col-span-1 lg:col-span-2">
            <SemesterComparison semesters={semesters} />
          </div>

          {/* 4. Subject Weaknesses */}
          <SubjectWeaknessMemory memory={memory} />

          {/* 5. Burnout Engine */}
          <BurnoutEngineView memory={memory} />
          
        </motion.div>
      )}

    </div>
  );
};

export default IntelligenceDashboard;
