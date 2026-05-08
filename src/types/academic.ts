import { Timestamp } from 'firebase/firestore';

export interface AttendanceRecord {
  id: string;
  userId: string;
  subjectName: string;
  attendancePercentage: number;
  attendedLectures: number;
  totalLectures: number;
  shortageRisk: 'low' | 'medium' | 'high';
  updatedAt: Timestamp;
}

export interface AssignmentRecord {
  id: string;
  userId: string;
  title: string;
  subject: string;
  marks: number;
  maxMarks: number;
  deadline: Timestamp;
  status: 'pending' | 'submitted' | 'graded';
  priority: 'low' | 'medium' | 'high';
  faculty: string;
}

export interface TimetableEntry {
  id: string;
  userId: string;
  subject: string;
  room: string;
  startTime: string;
  endTime: string;
  day: string;
  faculty: string;
}

export interface AcademicUpload {
  id: string;
  userId: string;
  type: 'attendance' | 'marks' | 'assignment' | 'timetable' | 'pdf_report';
  status: 'processing' | 'verified' | 'failed';
  confidence: number;
  imageUrl?: string;
  fileName: string;
  timestamp: Timestamp;
  extractedData?: any;
}

export interface AIInsight {
  id: string;
  userId: string;
  type: 'attendance' | 'performance' | 'strategy';
  content: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: Timestamp;
}
