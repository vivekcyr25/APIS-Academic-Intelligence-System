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
  const validSems = semesters.filter(s => s.status === 'completed' || s.status === 'active' || s.status === 'archived');
  const initialSummary = memory
    ? generateEvolutionSummary(memory.deltas, memory.vectors)
    : 'Establishing baseline academic history. Complete and record semesters for deeper pattern detection.';
  const [summaryText, setSummaryText] = useState(initialSummary);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

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
    <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 border border-white/[0.08] bg-card/70 mb-8">
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        
        {/* Left: Summary & Interpretation */}
        <div className="max-w-2xl space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 text-violet-300 text-xs font-bold uppercase tracking-wider border border-violet-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              Academic Interpretation
            </span>
            <span className="provenance-tag">
              Grounded in {validSems.length} semester records
            </span>
            {memory && (
              <button 
                onClick={handleSynthesize} 
                disabled={isSynthesizing}
                className="text-xs text-muted-foreground hover:text-white transition-colors flex items-center gap-1.5 ml-auto sm:ml-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSynthesizing ? 'animate-spin' : ''}`} />
                {isSynthesizing ? 'Interpreting...' : 'Re-synthesize Context'}
              </button>
            )}
          </div>
          
          <AnimatePresence mode="wait">
            <motion.h2 
              key={summaryText}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={TRANSITIONS.DEFAULT}
              className="text-2xl sm:text-3xl font-black font-heading leading-tight tracking-tight text-white/95"
            >
              {summaryText}
            </motion.h2>
          </AnimatePresence>
          
          {memory?.vectors.burnoutRisk === 'low' && (
             <p className="text-emerald-400 text-xs font-medium flex items-center gap-2 pt-1">
               <ShieldCheck className="w-4 h-4" /> Academic workload stability is steady across recent semesters.
             </p>
          )}
        </div>

        {/* Right: Real Metrics with Provenance */}
        <div className="grid grid-cols-2 gap-3 shrink-0 sm:w-80">
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-violet-400" /> Current CGPA
            </p>
            <p className="text-2xl font-black font-mono text-white">{currentCgpa > 0 ? currentCgpa.toFixed(2) : '—'}</p>
            <span className="text-[10px] text-white/30 block mt-1">Weighted average</span>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> Consistency
            </p>
            <p className="text-2xl font-black font-mono text-white">{consistencyScore}<span className="text-xs text-muted-foreground font-normal ml-1">/100</span></p>
            <span className="text-[10px] text-white/30 block mt-1">Stability index</span>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] col-span-2">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" /> Highest Performing Term
            </p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-sm font-bold text-white/90">{strongestSem.label || `Semester ${strongestSem.number}`}</p>
              <p className="text-violet-400 font-black font-mono text-sm">{strongestSem.sgpa.toFixed(2)} SGPA</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
