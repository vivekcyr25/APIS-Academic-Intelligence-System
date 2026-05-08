import { useState, memo } from 'react';
import { Card } from '../ui/Card';
import type { Semester } from '../../types/academic-v2';
import { ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Props {
  semesters: Semester[];
}

export const SemesterComparison = memo(({ semesters }: Props) => {
  const validSems = semesters.filter(s => s.status === 'completed' || s.status === 'active' || s.status === 'archived');
  
  const [baseSemId, setBaseSemId] = useState<string>(validSems.length > 1 ? validSems[validSems.length - 2].id! : '');
  const [compareSemId, setCompareSemId] = useState<string>(validSems.length > 0 ? validSems[validSems.length - 1].id! : '');

  if (validSems.length < 2) return null;

  const baseSem = validSems.find(s => s.id === baseSemId);
  const compSem = validSems.find(s => s.id === compareSemId);

  if (!baseSem || !compSem) return null;

  const sgpaDelta = compSem.sgpa - baseSem.sgpa;
  const attDelta = compSem.avgAttendance - baseSem.avgAttendance;
  const creditDelta = compSem.earnedCredits - baseSem.earnedCredits;

  const renderDelta = (delta: number, isPercent = false) => {
    if (Math.abs(delta) < 0.01) return <span className="text-muted-foreground flex items-center gap-1"><Minus className="w-4 h-4" /> 0.00</span>;
    if (delta > 0) return <span className="text-emerald-400 flex items-center gap-1"><TrendingUp className="w-4 h-4" /> +{delta.toFixed(2)}{isPercent ? '%' : ''}</span>;
    return <span className="text-rose-400 flex items-center gap-1"><TrendingDown className="w-4 h-4" /> {delta.toFixed(2)}{isPercent ? '%' : ''}</span>;
  };

  return (
    <Card className="p-6 border-white/5 bg-black/40">
      <h3 className="text-xl font-black mb-6">Cross-Semester Comparison</h3>
      
      <div className="flex items-center gap-4 mb-8">
        <select 
          value={baseSemId} 
          onChange={e => setBaseSemId(e.target.value)}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none"
        >
          {validSems.map(s => <option key={s.id} value={s.id} className="bg-[#1a1a1a]">{s.label}</option>)}
        </select>
        
        <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0" />
        
        <select 
          value={compareSemId} 
          onChange={e => setCompareSemId(e.target.value)}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none"
        >
          {validSems.map(s => <option key={s.id} value={s.id} className="bg-[#1a1a1a]">{s.label}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">SGPA Delta</p>
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-black">{compSem.sgpa.toFixed(2)}</span>
            <div className="text-sm font-bold bg-black/20 px-2 py-1 rounded-md mt-1">
              {renderDelta(sgpaDelta)}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">Attendance Delta</p>
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-black">{compSem.avgAttendance.toFixed(1)}%</span>
            <div className="text-sm font-bold bg-black/20 px-2 py-1 rounded-md mt-1">
              {renderDelta(attDelta, true)}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">Credits Earned</p>
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-black">{compSem.earnedCredits}</span>
            <div className="text-sm font-bold bg-black/20 px-2 py-1 rounded-md mt-1">
              {renderDelta(creditDelta)}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
});
