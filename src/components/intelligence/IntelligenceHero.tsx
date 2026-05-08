import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, ShieldCheck, Zap, RefreshCw } from 'lucide-react';
import type { Semester, AcademicMemory } from '../../types/academic-v2';
import { generateEvolutionSummary } from '../../services/academic/retrospectiveService';
import { generateAcademicReflection } from '../../services/ai/aiService';
import { TRANSITIONS } from '../../lib/motion';

interface Props {
  semesters: Semester[];
  memory: AcademicMemory | null;
}

export const IntelligenceHero = ({ semesters, memory }: Props) => {
  if (semesters.length === 0) return null;

  const validSems = semesters.filter(s => s.status === 'completed' || s.status === 'active' || s.status === 'archived');
  if (validSems.length === 0) return null;

  let tCredits = 0;
  let tPoints = 0;
  validSems.forEach(s => {
    if (s.totalCredits > 0) {
      tCredits += s.totalCredits;
      tPoints += (s.sgpa * s.totalCredits);
    }
  });
  const currentCgpa = tCredits > 0 ? tPoints / tCredits : 0;
  
  const strongestSem = validSems.reduce((prev, current) => (prev.sgpa > current.sgpa) ? prev : current);
  
  const consistencyScore = memory?.vectors.consistencyScore || 0;
  const initialSummary = memory ? generateEvolutionSummary(memory.deltas, memory.vectors) : "Establishing baseline academic memory. Complete more semesters for deeper insights.";

  const [summaryText, setSummaryText] = useState(initialSummary);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const handleSynthesize = async () => {
    if (!memory) return;
    setIsSynthesizing(true);
    try {
      const aiText = await generateAcademicReflection(initialSummary, memory.vectors);
      setSummaryText(aiText);
    } catch (e) {
      // Error handled silently
    } finally {
      setIsSynthesizing(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl p-8 border border-primary/20 bg-card mb-10 shadow-[0_0_50px_rgba(139,92,246,0.15)] group">
      {/* Background Neural Effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none group-hover:bg-primary/20 transition-all duration-1000" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-1000" />
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
        
        {/* Left: AI Summary */}
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest border border-primary/20 neural-hover">
              <Sparkles className="w-4 h-4" />
              AI Retrospective
            </div>
            {memory && (
              <button 
                onClick={handleSynthesize} 
                disabled={isSynthesizing}
                className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isSynthesizing ? 'animate-spin' : ''}`} />
                {isSynthesizing ? 'Synthesizing...' : 'Synthesize Insights'}
              </button>
            )}
          </div>
          
          <AnimatePresence mode="wait">
            <motion.h2 
              key={summaryText}
              initial={{ opacity: 0, filter: 'blur(10px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(10px)' }}
              transition={TRANSITIONS.DEFAULT}
              className="text-3xl md:text-5xl font-black font-heading leading-tight tracking-tight gradient-title mb-4"
            >
              {summaryText}
            </motion.h2>
          </AnimatePresence>
          
          {memory?.vectors.burnoutRisk === 'low' && (
             <p className="text-emerald-400 font-medium flex items-center gap-2">
               <ShieldCheck className="w-5 h-5" /> Burnout risk is stable. Excellent workload management.
             </p>
          )}
        </div>

        {/* Right: Core Metrics */}
        <div className="grid grid-cols-2 gap-4 shrink-0">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 glass-card">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-primary" /> Current CGPA
            </p>
            <p className="text-3xl font-black">{currentCgpa.toFixed(2)}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 glass-card">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> Consistency
            </p>
            <p className="text-3xl font-black">{consistencyScore}<span className="text-sm text-muted-foreground ml-1">/100</span></p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 glass-card col-span-2">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" /> Strongest Block
            </p>
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold">{strongestSem.label}</p>
              <p className="text-primary font-black">{strongestSem.sgpa.toFixed(2)} SGPA</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
