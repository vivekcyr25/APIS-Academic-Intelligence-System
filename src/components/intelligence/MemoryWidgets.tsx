import { Card } from '../ui/Card';
import type { AcademicMemory } from '../../types/academic-v2';
import { AlertTriangle, Activity, BookOpen } from 'lucide-react';
import { getSubjectPatternInsights } from '../../services/academic/retrospectiveService';

interface Props {
  memory: AcademicMemory | null;
}

export const BurnoutEngineView = ({ memory }: Props) => {
  if (!memory) return null;

  const risk = memory.vectors.burnoutRisk;
  const isHighRisk = risk === 'high' || risk === 'critical';

  return (
    <Card className="p-6 border-white/[0.08] bg-card/70">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl border ${isHighRisk ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
          {isHighRisk ? <AlertTriangle className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white">Academic Workload Signal</h3>
            <span className="provenance-tag">
              From credit density & deadlines
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mt-1">
            {isHighRisk 
              ? "Recent academic records indicate high workload concentration. Variation in attendance paired with heavy credit density suggests focusing on foundational course stability." 
              : "Workload distribution is balanced. You are completing course requirements steadily without elevated variance markers."}
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
    <Card className="p-6 border-white/[0.08] bg-card/70">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl border bg-violet-500/10 border-violet-500/20 text-violet-400">
          <BookOpen className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white">Subject Performance Patterns</h3>
            <span className="provenance-tag">
              Historical grade analysis
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mt-1">{insight}</p>
          {weaknesses.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-2 border-t border-white/[0.05]">
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mr-1 self-center">
                Attention areas:
              </span>
              {weaknesses.slice(0, 5).map(w => (
                <span key={w} className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-xs font-semibold text-white/80">
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
