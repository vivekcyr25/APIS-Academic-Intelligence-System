import { Card } from '../ui/Card';
import type { AcademicMemory } from '../../types/academic-v2';
import { AlertTriangle, Activity, BrainCircuit } from 'lucide-react';
import { getSubjectPatternInsights } from '../../services/academic/retrospectiveService';

interface Props {
  memory: AcademicMemory | null;
}

export const BurnoutEngineView = ({ memory }: Props) => {
  if (!memory) return null;

  const risk = memory.vectors.burnoutRisk;
  const isHighRisk = risk === 'high' || risk === 'critical';

  return (
    <Card className="p-6 border-white/5 bg-black/40">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl border ${isHighRisk ? 'bg-rose-500/20 border-rose-500/30 text-rose-400' : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'}`}>
          {isHighRisk ? <AlertTriangle className="w-6 h-6" /> : <Activity className="w-6 h-6" />}
        </div>
        <div>
          <h3 className="text-lg font-bold">Burnout & Workload Engine</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {isHighRisk 
              ? "Longitudinal data indicates potential burnout. Recent semesters show high variance in attendance paired with credit density drops. Focus on stability." 
              : "Workload intensity is stable. You are managing credit density efficiently without triggering exhaustion markers."}
          </p>
        </div>
      </div>
    </Card>
  );
};

export const SubjectWeaknessMemory = ({ memory }: Props) => {
  if (!memory) return null;

  const weaknesses = memory.vectors.subjectWeaknesses;
  const insight = getSubjectPatternInsights(weaknesses);

  return (
    <Card className="p-6 border-white/5 bg-black/40">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl border bg-fuchsia-500/20 border-fuchsia-500/30 text-fuchsia-400">
          <BrainCircuit className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold">Subject Memory Patterns</h3>
          <p className="text-sm text-muted-foreground mt-1">{insight}</p>
          {weaknesses.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {weaknesses.slice(0, 5).map(w => (
                <span key={w} className="px-2 py-1 rounded bg-white/5 border border-white/10 text-xs font-bold text-muted-foreground">
                  {w}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
