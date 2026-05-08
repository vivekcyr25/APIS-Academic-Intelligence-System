import type { SemesterDelta, MemoryVector } from '../../types/academic-v2';

export const generateEvolutionSummary = (deltas: SemesterDelta[], vectors: MemoryVector): string => {
  if (deltas.length === 0) return "Not enough data to analyze evolution. Keep updating your vault.";

  const recent = deltas[deltas.length - 1];
  
  if (vectors.consistencyScore > 80 && recent.sgpaDelta > 0) {
    return "Your academic consistency is highly stable, with recent positive momentum.";
  }
  
  if (vectors.attendancePattern === 'improving') {
    return "You have demonstrated a strong, consistent recovery in attendance.";
  }

  if (vectors.burnoutRisk === 'high' || vectors.burnoutRisk === 'critical') {
    return "Indicators suggest a high workload intensity. Focus on stability this semester.";
  }

  if (recent.sgpaDelta < 0) {
    return `A minor pivot in performance detected. You have the structural baseline for a strong recovery.`;
  }

  return "Your academic trajectory shows steady, reliable progress.";
};

export const getSubjectPatternInsights = (weaknesses: string[]): string => {
  if (weaknesses.length === 0) return "No recurring subject weaknesses detected.";
  
  // Group by common prefixes (e.g. CSE, MTH)
  const prefixes = weaknesses.map(w => w.substring(0, 3));
  const counts = prefixes.reduce((acc, p) => { acc[p] = (acc[p] || 0) + 1; return acc; }, {} as Record<string, number>);
  
  const maxPrefix = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, '');
  
  if (counts[maxPrefix] > 1) {
    return `${maxPrefix} domain subjects show high workload intensity. Targeted conceptual focus will restore momentum.`;
  }
  
  return "Occasional dips in performance detected, but no systemic domain weaknesses.";
};
