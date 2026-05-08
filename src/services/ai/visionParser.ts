import type { AttendanceRecord, AssignmentRecord, TimetableEntry } from '../../types/academic';

/**
 * Structures raw extracted text from OCR into specialized academic models.
 * This is the "brain" that normalizes institutional data.
 */
export const structureAcademicData = (rawText: string, type: string) => {

  
  // Clean text
  const cleanText = rawText.replace(/\s+/g, ' ').trim();

  switch (type) {
    case 'attendance':
      return parseAttendance(cleanText);
    case 'assignment':
      return parseAssignments(cleanText);
    case 'timetable':
      return parseTimetable(cleanText);
    default:
      return { raw: rawText };
  }
};

const parseAttendance = (text: string) => {
  // Example regex patterns for LPU UMS attendance format
  // Subject Code | Subject Name | % | Lectures
  const records: Partial<AttendanceRecord>[] = [];
  
  // Simple heuristic for demo: Look for percentages and subject codes
  const subjectMatches = text.match(/[A-Z]{3}[0-9]{3}/g) || [];
  const percentages = text.match(/[0-9]{1,3}(\.[0-9]+)?%/g) || [];

  subjectMatches.forEach((code, i) => {
    records.push({
      subjectName: code,
      attendancePercentage: percentages[i] ? parseFloat(percentages[i]) : 75,
      attendedLectures: 0,
      totalLectures: 0,
      shortageRisk: 'low'
    });
  });

  return records;
};

const parseAssignments = (text: string) => {
  // Logic to detect CA/Assignment marks
  const records: Partial<AssignmentRecord>[] = [];
  // Mock structuring logic for now - real implementation will use Gemini structuring
  return records;
};

const parseTimetable = (text: string) => {
  const records: Partial<TimetableEntry>[] = [];
  return records;
};

/**
 * Calculates a confidence score based on text quality and pattern matching.
 */
export const calculateConfidence = (rawText: string): number => {
  if (rawText.length < 50) return 45;
  if (rawText.includes('%') || rawText.includes('Subject')) return 92;
  return 65;
};
