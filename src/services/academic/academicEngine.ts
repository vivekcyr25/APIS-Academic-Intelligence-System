/**
 * APIS AI — Academic Intelligence Engine
 * 
 * Credit-aware SGPA/CGPA calculations, risk detection,
 * priority classification, and AI insight generation.
 */

import type {
  Subject, Semester, AcademicProfile, AcademicInsight,
  SemesterHistoryEntry, GradeScale, PriorityLevel, RiskLevel
} from '../../types/academic-v2.ts';
import { GRADE_SCALES } from '../../types/academic-v2.ts';

// ─────────────────────────────────────────────────────────
// GRADE POINT LOOKUP
// ─────────────────────────────────────────────────────────

export const getGradePoints = (grade: string, scale: GradeScale = 'lpu_10'): number => {
  const scaleMap = GRADE_SCALES[scale] ?? GRADE_SCALES.lpu_10;
  return scaleMap[grade] ?? 0;
};

export const getGradeFromTotal = (total: number, scale: GradeScale = 'lpu_10'): string => {
  if (scale === 'lpu_10' || scale === 'vtu_10') {
    if (total >= 90) return 'O';
    if (total >= 80) return 'A+';
    if (total >= 70) return 'A';
    if (total >= 60) return 'B+';
    if (total >= 50) return 'B';
    if (total >= 40) return 'C';
    return 'F';
  }
  if (scale === 'percentage') {
    if (total >= 90) return 'A';
    if (total >= 75) return 'B';
    if (total >= 60) return 'C';
    if (total >= 40) return 'D';
    return 'F';
  }
  if (total >= 90) return 'O';
  if (total >= 80) return 'A+';
  if (total >= 70) return 'A';
  if (total >= 60) return 'B+';
  if (total >= 50) return 'B';
  if (total >= 40) return 'C';
  return 'F';
};

// ─────────────────────────────────────────────────────────
// PRIORITY CLASSIFICATION
// ─────────────────────────────────────────────────────────

export const classifyPriority = (credits: number): PriorityLevel => {
  if (credits >= 4) return 'high';
  if (credits >= 3) return 'medium';
  return 'low';
};

// ─────────────────────────────────────────────────────────
// ATTENDANCE RISK
// ─────────────────────────────────────────────────────────

export const getAttendanceRisk = (percentage: number): RiskLevel => {
  if (percentage < 60) return 'critical';
  if (percentage < 75) return 'high';
  if (percentage < 80) return 'medium';
  return 'low';
};

// ─────────────────────────────────────────────────────────
// SUBJECT TOTAL & GRADE CALCULATION
// ─────────────────────────────────────────────────────────

export const computeSubjectTotal = (
  s: Partial<Subject>,
  bestOfCA: boolean = false
): number => {
  const ca = bestOfCA ? Math.max(s.ca1 ?? 0, s.ca2 ?? 0) : (s.ca1 ?? 0) + (s.ca2 ?? 0);
  const theory = ca + (s.mte ?? 0) + (s.ete ?? 0);
  const lab = s.labMarks ?? 0;
  const attendance = s.attendanceMarks ?? 0;
  const assignment = s.assignmentScore ?? 0;
  return Math.min(100, theory + lab + attendance + assignment);
};

// ─────────────────────────────────────────────────────────
// SGPA CALCULATION (weighted)
// ─────────────────────────────────────────────────────────

export const calculateSGPA = (
  subjects: Subject[],
  scale: GradeScale = 'lpu_10'
): number => {
  const graded = subjects.filter(s => s.credits > 0 && s.grade);
  if (graded.length === 0) return 0;

  const totalWeightedPoints = graded.reduce((acc, s) => {
    const gp = getGradePoints(s.grade, scale);
    return acc + gp * s.credits;
  }, 0);

  const totalCredits = graded.reduce((acc, s) => acc + s.credits, 0);
  if (totalCredits === 0) return 0;

  return parseFloat((totalWeightedPoints / totalCredits).toFixed(2));
};

// ─────────────────────────────────────────────────────────
// CGPA CALCULATION (across semesters)
// ─────────────────────────────────────────────────────────

export const calculateCGPA = (history: SemesterHistoryEntry[]): number => {
  const completed = history.filter(h => h.credits > 0);
  if (completed.length === 0) return 0;

  const totalWeighted = completed.reduce((acc, h) => acc + h.sgpa * h.credits, 0);
  const totalCredits = completed.reduce((acc, h) => acc + h.credits, 0);
  if (totalCredits === 0) return 0;

  return parseFloat((totalWeighted / totalCredits).toFixed(2));
};

// ─────────────────────────────────────────────────────────
// CGPA DELTA PROJECTION
// What CGPA change if one subject improves by N marks?
// ─────────────────────────────────────────────────────────

export const projectCGPADelta = (
  subject: Subject,
  newTotal: number,
  allSemHistory: SemesterHistoryEntry[],
  currentSemSubjects: Subject[],
  scale: GradeScale = 'lpu_10'
): { newSGPA: number; newCGPA: number; delta: number } => {
  const newGrade = getGradeFromTotal(newTotal, scale);
  const updatedSubjects = currentSemSubjects.map(s =>
    s.id === subject.id ? { ...s, grade: newGrade, total: newTotal } : s
  );
  const newSGPA = calculateSGPA(updatedSubjects, scale);
  const totalSemCredits = currentSemSubjects.reduce((a, s) => a + s.credits, 0);
  const histWithoutCurrent = allSemHistory.filter(h => h.semId !== subject.semesterId);
  const newCGPA = calculateCGPA([
    ...histWithoutCurrent,
    { semId: subject.semesterId, semNumber: subject.semesterNumber, sgpa: newSGPA, credits: totalSemCredits, earnedCredits: totalSemCredits }
  ]);
  const currentCGPA = calculateCGPA(allSemHistory);
  return { newSGPA, newCGPA, delta: parseFloat((newCGPA - currentCGPA).toFixed(2)) };
};

// ─────────────────────────────────────────────────────────
// RISK DETECTION
// ─────────────────────────────────────────────────────────

export const detectRiskSubjects = (subjects: Subject[]): Subject[] => {
  return subjects.filter(s => {
    const isHighCredit = s.credits >= 3;
    const isLowMarks = s.total < 50 || s.grade === 'F' || s.grade === 'C';
    const isAttendanceRisk = s.attendancePercentage < 75;
    return isHighCredit && (isLowMarks || isAttendanceRisk);
  });
};

// ─────────────────────────────────────────────────────────
// AI INSIGHT GENERATOR
// ─────────────────────────────────────────────────────────

export const generateInsights = (
  profile: AcademicProfile,
  subjects: Subject[],
  semHistory: SemesterHistoryEntry[],
  currentSemSubjects: Subject[]
): AcademicInsight[] => {
  const insights: AcademicInsight[] = [];

  // 1. Attendance shortage warnings
  subjects.forEach(s => {
    if (s.attendancePercentage < 75 && s.attendancePercentage > 0) {
      const needed = Math.ceil((0.75 * s.totalLectures - s.attendedLectures) / 0.25);
      insights.push({
        id: `att-${s.id}`,
        category: 'attendance_risk',
        priority: s.credits >= 4 ? 'high' : 'medium',
        title: `Attendance Shortage — ${s.name}`,
        message: `You need to attend ${needed} more consecutive classes in ${s.name} to reach the 75% minimum.`,
        impact: s.credits >= 4 ? 'High-credit impact on SGPA' : undefined,
        subjectId: s.id,
        subjectName: s.name,
        actionable: true,
      });
    }
  });

  // 2. High-credit performance risk
  const riskSubjects = detectRiskSubjects(subjects);
  riskSubjects.forEach(s => {
    if (s.total < 50 && s.credits >= 4) {
      const marksNeeded = 60 - s.total;
      const { delta } = projectCGPADelta(s, s.total + marksNeeded, semHistory, currentSemSubjects, profile.gradeScale);
      insights.push({
        id: `perf-${s.id}`,
        category: 'cgpa_opportunity',
        priority: 'high',
        title: `CGPA Opportunity — ${s.name}`,
        message: `Improving ${s.name} by ${marksNeeded} marks could increase your SGPA by ${Math.abs(delta).toFixed(2)} points.`,
        impact: `+${Math.abs(delta).toFixed(2)} CGPA impact`,
        subjectId: s.id,
        subjectName: s.name,
        actionable: true,
      });
    }
  });

  // 3. Trend insight
  if (semHistory.length >= 2) {
    const last = semHistory[semHistory.length - 1];
    const prev = semHistory[semHistory.length - 2];
    if (last && prev) {
      const diff = last.sgpa - prev.sgpa;
      if (Math.abs(diff) >= 0.1) {
        insights.push({
          id: `trend-${Date.now()}`,
          category: 'trend',
          priority: diff > 0 ? 'low' : 'medium',
          title: diff > 0 ? `Semester ${last.semNumber} is your best yet` : `Performance Decline Detected`,
          message: diff > 0
            ? `Your SGPA improved by ${diff.toFixed(2)} from the previous semester. Keep the momentum.`
            : `Your SGPA dropped by ${Math.abs(diff).toFixed(2)} from the previous semester. Consider reviewing study strategy.`,
          actionable: diff < 0,
        });
      }
    }
  }

  return insights;
};

// ─────────────────────────────────────────────────────────
// SEMESTER ANALYTICS SUMMARY
// ─────────────────────────────────────────────────────────

export const computeSemesterSummary = (
  subjects: Subject[],
  profile: AcademicProfile
) => {
  const totalCredits = subjects.reduce((a, s) => a + s.credits, 0);
  const earnedCredits = subjects.filter(s => s.grade !== 'F').reduce((a, s) => a + s.credits, 0);
  const failedCredits = subjects.filter(s => s.grade === 'F').reduce((a, s) => a + s.credits, 0);
  const sgpa = calculateSGPA(subjects, profile.gradeScale);
  const avgAttendance = subjects.length > 0
    ? parseFloat((subjects.reduce((a, s) => a + (s.attendancePercentage || 0), 0) / subjects.length).toFixed(1))
    : 0;
  const highRiskCount = subjects.filter(s => s.shortageRisk === 'high' || s.shortageRisk === 'critical').length;
  const topSubject = [...subjects].sort((a, b) => b.total - a.total)[0];
  const weakSubject = [...subjects].sort((a, b) => a.total - b.total)[0];

  return {
    totalCredits,
    earnedCredits,
    failedCredits,
    sgpa,
    avgAttendance,
    highRiskCount,
    topSubject,
    weakSubject,
    subjectCount: subjects.length,
  };
};
