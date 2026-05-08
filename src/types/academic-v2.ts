import type { Timestamp } from 'firebase/firestore';

// ─────────────────────────────────────────────────────────
// DOMAIN TYPES
// ─────────────────────────────────────────────────────────

export type AcademicDomain =
  | 'engineering'
  | 'medical'
  | 'law'
  | 'commerce'
  | 'school'
  | 'competitive'
  | 'custom';

export type GradeScale =
  | 'lpu_10'      // O=10, A+=9, A=8, B+=7, B=6, C=5, F=0
  | 'vtu_10'      // Similar 10-pt
  | 'cbse_10'     // Class-based
  | 'percentage'  // 0–100%
  | 'gpa_4'       // A=4, B=3, C=2, D=1, F=0
  | 'custom';

export type SubjectType =
  | 'theory'
  | 'lab'
  | 'project'
  | 'elective'
  | 'minor'
  | 'pel'         // Professional Elective / LPU PEL
  | 'audit';

export type SemesterStatus = 'active' | 'completed' | 'upcoming' | 'archived';
export type PriorityLevel = 'high' | 'medium' | 'low';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

// ─────────────────────────────────────────────────────────
// ACADEMIC PROFILE (user's educational identity)
// ─────────────────────────────────────────────────────────

export interface AcademicProfile {
  userId: string;
  domain: AcademicDomain;
  institutionName: string;
  programName: string;          // "B.Tech CSE", "MBBS", "Class 12", "CA Foundation"
  programAbbr?: string;         // "CSE", "ECE", "MBBS"
  totalSemesters: number;       // 8 for BTech, 12 for MBBS, etc.
  currentSemester: number;
  gradeScale: GradeScale;
  creditSystem: boolean;
  bestOfCA: boolean;            // LPU uses best of CA1/CA2
  onboardingComplete: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// ─────────────────────────────────────────────────────────
// SUBJECT (fully credit-aware, LPU-compatible)
// ─────────────────────────────────────────────────────────

export interface Subject {
  id?: string;
  userId: string;
  semesterId: string;
  semesterNumber: number;

  // Identity
  code: string;                 // "CSE301", "MATH201"
  name: string;
  subjectType: SubjectType;
  faculty: string;
  credits: number;              // 1–5

  // Marks breakdown (LPU model)
  ca1: number;                  // 0–30
  ca2: number;                  // 0–30
  bestCA: number;               // max(ca1, ca2) if bestOfCA enabled
  mte: number;                  // 0–40 (MidTerm Exam)
  ete: number;                  // 0–100 (EndTerm Exam)
  labMarks: number;             // 0–50 (for lab subjects)
  attendanceMarks: number;      // if institution awards marks for attendance
  assignmentScore: number;
  total: number;                // computed total

  // Grade & GPA
  grade: string;                // 'O', 'A+', 'A', 'B+', 'B', 'C', 'F'
  gradePoints: number;          // 10, 9, 8, 7, 6, 5, 0
  gpaContribution: number;      // credits × gradePoints

  // Attendance
  attendedLectures: number;
  totalLectures: number;
  attendancePercentage: number;

  // AI-derived
  priority: PriorityLevel;      // derived from credits
  shortageRisk: RiskLevel;
  performanceRisk: RiskLevel;   // low marks in high-credit subject

  // Meta
  source: 'manual' | 'ai_upload';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// ─────────────────────────────────────────────────────────
// SEMESTER VAULT
// ─────────────────────────────────────────────────────────

export interface Semester {
  id?: string;
  userId: string;
  number: number;
  label: string;                // "Semester 1", "Year 1 - Sem 1"
  status: SemesterStatus;
  
  // Computed (from subjects)
  totalCredits: number;
  earnedCredits: number;
  failedCredits: number;
  sgpa: number;
  avgAttendance: number;
  
  // Timeline
  startDate?: string;
  endDate?: string;
  examPeriodStart?: string;
  examPeriodEnd?: string;
  
  // Meta
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// ─────────────────────────────────────────────────────────
// CGPA RECORD (across all semesters)
// ─────────────────────────────────────────────────────────

export interface SemesterHistoryEntry {
  semId: string;
  semNumber: number;
  sgpa: number;
  credits: number;
  earnedCredits: number;
}

export interface CGPARecord {
  userId: string;
  cgpa: number;
  totalCreditsRegistered: number;
  totalCreditsEarned: number;
  semesterHistory: SemesterHistoryEntry[];
  trend: 'improving' | 'declining' | 'stable';
  updatedAt?: Timestamp;
}

// ─────────────────────────────────────────────────────────
// AI INSIGHTS
// ─────────────────────────────────────────────────────────

export type InsightCategory =
  | 'attendance_risk'
  | 'performance_risk'
  | 'cgpa_opportunity'
  | 'milestone'
  | 'trend'
  | 'recommendation';

export interface AcademicInsight {
  id: string;
  category: InsightCategory;
  priority: PriorityLevel;
  title: string;
  message: string;
  impact?: string;              // "May improve SGPA by 0.4"
  subjectId?: string;
  subjectName?: string;
  actionable: boolean;
}

// ─────────────────────────────────────────────────────────
// TIMELINE EVENTS
// ─────────────────────────────────────────────────────────

export type TimelineEventType =
  | 'ca_exam'
  | 'mte_exam'
  | 'ete_exam'
  | 'assignment_deadline'
  | 'lab_submission'
  | 'project_deadline'
  | 'holiday'
  | 'semester_start'
  | 'semester_end'
  | 'internship'
  | 'workshop'
  | 'placement_prep'
  | 'result_declaration'
  | 'viva'
  | 'practical';

export type EventStatus = 'pending' | 'in_progress' | 'completed' | 'missed';

export interface TimelineEvent {
  id?: string;
  userId: string;
  semesterId: string;
  type: TimelineEventType;
  title: string;
  startDate: string;            // ISO date string
  endDate?: string;             // ISO date string (optional for point-in-time events)
  subjectId?: string;
  note?: string;
  priority: PriorityLevel;
  status: EventStatus;
  attachments?: string[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// ─────────────────────────────────────────────────────────
// ACADEMIC MEMORY LAYER
// ─────────────────────────────────────────────────────────

export interface SemesterDelta {
  semesterId: string;
  sgpaDelta: number;
  attendanceDelta: number;
  creditCompletionRate: number;
}

export interface MemoryVector {
  subjectWeaknesses: string[];    // Array of subject codes where student consistently underperforms
  attendancePattern: 'consistent' | 'declining' | 'erratic' | 'improving';
  burnoutRisk: RiskLevel;         // Based on high-credit instability and tight deadlines
  consistencyScore: number;       // 0-100 scale measuring stability across semesters
}

export interface AcademicMemory {
  userId: string;
  vectors: MemoryVector;
  deltas: SemesterDelta[];
  lastCalculated: Timestamp;
}

// ─────────────────────────────────────────────────────────
// DOMAIN CONFIGURATION (for adaptive UI)
// ─────────────────────────────────────────────────────────

export interface DomainConfig {
  domain: AcademicDomain;
  label: string;
  icon: string;
  description: string;
  defaultTotalSemesters: number;
  defaultGradeScale: GradeScale;
  defaultCreditSystem: boolean;
  semesterLabel: string;        // "Semester", "Year", "Term", "Attempt"
  subjectTypes: SubjectType[];
  evaluationModel: 'lpu' | 'percentage' | 'cbse' | 'custom';
}

export const DOMAIN_CONFIGS: DomainConfig[] = [
  {
    domain: 'engineering',
    label: 'Engineering',
    icon: '⚙️',
    description: 'B.Tech / B.E. programs with credit-based grading',
    defaultTotalSemesters: 8,
    defaultGradeScale: 'lpu_10',
    defaultCreditSystem: true,
    semesterLabel: 'Semester',
    subjectTypes: ['theory', 'lab', 'elective', 'minor', 'pel', 'project'],
    evaluationModel: 'lpu',
  },
  {
    domain: 'medical',
    label: 'Medical',
    icon: '🩺',
    description: 'MBBS, BDS, BAMS — year + rotation structure',
    defaultTotalSemesters: 12,
    defaultGradeScale: 'percentage',
    defaultCreditSystem: false,
    semesterLabel: 'Year',
    subjectTypes: ['theory', 'lab', 'project'],
    evaluationModel: 'percentage',
  },
  {
    domain: 'commerce',
    label: 'Commerce & Management',
    icon: '📊',
    description: 'BBA, MBA, B.Com, CA programs',
    defaultTotalSemesters: 6,
    defaultGradeScale: 'lpu_10',
    defaultCreditSystem: true,
    semesterLabel: 'Semester',
    subjectTypes: ['theory', 'project', 'elective'],
    evaluationModel: 'lpu',
  },
  {
    domain: 'law',
    label: 'Law',
    icon: '⚖️',
    description: 'LLB, LLM, BA LLB programs',
    defaultTotalSemesters: 10,
    defaultGradeScale: 'percentage',
    defaultCreditSystem: true,
    semesterLabel: 'Semester',
    subjectTypes: ['theory', 'project', 'elective'],
    evaluationModel: 'percentage',
  },
  {
    domain: 'school',
    label: 'School',
    icon: '📚',
    description: 'Class 9–12, CBSE / ICSE / State Board',
    defaultTotalSemesters: 2,
    defaultGradeScale: 'cbse_10',
    defaultCreditSystem: false,
    semesterLabel: 'Term',
    subjectTypes: ['theory', 'lab', 'project'],
    evaluationModel: 'cbse',
  },
  {
    domain: 'competitive',
    label: 'Competitive Exams',
    icon: '🎯',
    description: 'JEE, UPSC, NEET, GATE, CAT preparation',
    defaultTotalSemesters: 4,
    defaultGradeScale: 'percentage',
    defaultCreditSystem: false,
    semesterLabel: 'Attempt Cycle',
    subjectTypes: ['theory'],
    evaluationModel: 'percentage',
  },
  {
    domain: 'custom',
    label: 'Custom Program',
    icon: '✨',
    description: 'Any other educational system',
    defaultTotalSemesters: 6,
    defaultGradeScale: 'percentage',
    defaultCreditSystem: true,
    semesterLabel: 'Semester',
    subjectTypes: ['theory', 'lab', 'project', 'elective'],
    evaluationModel: 'custom',
  },
];

// ─────────────────────────────────────────────────────────
// GRADE SCALE DEFINITIONS
// ─────────────────────────────────────────────────────────

export const GRADE_SCALES: Record<GradeScale, Record<string, number>> = {
  lpu_10: { O: 10, 'A+': 9, A: 8, 'B+': 7, B: 6, C: 5, F: 0 },
  vtu_10: { O: 10, 'A+': 9, A: 8, 'B+': 7, B: 6, C: 5, F: 0 },
  cbse_10: { 'A1': 10, 'A2': 9, 'B1': 8, 'B2': 7, 'C1': 6, 'C2': 5, 'D': 4, 'E': 3, F: 0 },
  percentage: { A: 4, B: 3, C: 2, D: 1, F: 0 },
  gpa_4: { A: 4, 'A-': 3.7, 'B+': 3.3, B: 3, 'B-': 2.7, 'C+': 2.3, C: 2, F: 0 },
  custom: { A: 10, B: 8, C: 6, D: 4, F: 0 },
};
