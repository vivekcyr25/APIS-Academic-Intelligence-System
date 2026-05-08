import type { Semester, Subject } from '../../types/academic-v2';

export interface PredictiveModel {
  projectedSgpa: number;
  projectedCgpa: number;
  attendanceForecast: 'stable' | 'risk' | 'critical';
  confidenceScore: number; // 0-100
}

/**
 * Foundation layer for future AI predictive capabilities.
 * Currently uses rule-based linear extrapolation.
 */
export const calculatePredictions = (
  history: Semester[],
  currentSemesterSubjects: Subject[]
): PredictiveModel | null => {
  if (history.length === 0) return null;

  // Compute cumulative GPA up to the latest semester
  let totalCredits = 0;
  let totalPoints = 0;
  history.forEach(s => {
    if (s.totalCredits > 0) {
      totalCredits += s.totalCredits;
      totalPoints += (s.sgpa * s.totalCredits);
    }
  });
  const cgpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
  
  // Future: Use Gemini to process complex trajectories
  return {
    projectedSgpa: parseFloat((cgpa + 0.1).toFixed(2)), // Mock
    projectedCgpa: parseFloat(cgpa.toFixed(2)),
    attendanceForecast: 'stable',
    confidenceScore: 40 // Low confidence until ML models are integrated
  };
};
