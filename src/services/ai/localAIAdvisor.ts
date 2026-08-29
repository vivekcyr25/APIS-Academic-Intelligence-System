import type { MarkRecord } from '../marks/marksService';
import type { Semester, AcademicProfile } from '../../types/academic-v2';
import { isExplicitOrInappropriate, SAFETY_REFUSAL_MESSAGE } from './safetyFilter';

/**
 * Local Academic Intelligence Engine
 * Provides instant, zero-latency cognitive reflections, study roadmaps,
 * and conversational academic insights directly in the browser when
 * remote cloud endpoints are offline or unavailable.
 */
export function generateLocalAcademicResponse(
  query: string,
  user: { name?: string; regNo?: string; rollNo?: string } | null,
  marks: MarkRecord[] = [],
  profile?: AcademicProfile | null,
  semesters?: Semester[]
): string {
  // ── Explicit / Inappropriate Content Safety Filter ──
  if (isExplicitOrInappropriate(query)) {
    return SAFETY_REFUSAL_MESSAGE;
  }

  const q = query.toLowerCase().trim();
  const studentName = user?.name || 'Scholar';
  
  // Compute marks summary
  const totalSubjects = marks.length;
  const avgMarks = totalSubjects > 0 
    ? (marks.reduce((sum, m) => sum + (Number(m.total) || 0), 0) / totalSubjects).toFixed(1)
    : 'N/A';
  
  const highScoring = marks.filter(m => Number(m.total) >= 75);
  const atRisk = marks.filter(m => Number(m.total) < 50 && Number(m.total) > 0);

  // 1. Greetings & Introductory queries
  if (/^(hi|hello|hey|greetings|start|hola|yo|help)\b/i.test(q)) {
    if (totalSubjects === 0) {
      return `• **Status:** Academic Vault online for ${studentName}.
• **Action:** Upload marks/attendance screenshots in the **Upload Center** to activate analytics.
• **Capabilities:** Ask for CA projections, subject risk alerts, or targeted exam strategies.`;
    }

    return `• **Scholar:** ${studentName} (${totalSubjects} subjects tracked, Avg: ${avgMarks}%)
• **Risk Radar:** ${atRisk.length > 0 ? `Focus needed in ${atRisk.map(m => m.subject).join(', ')}` : 'All subjects in stable trajectory.'}
• **Next Step:** Ask for target ETE marks, revision priority, or assignment schedules.`;
  }

  // 2. Marks, Grades, or GPA queries
  if (/(mark|grade|score|sgpa|cgpa|gpa|percentage|result|performance)/i.test(q)) {
    if (totalSubjects === 0) {
      return `• **No Records Found:** Please upload marks via **Upload Center** or add them in **Semester Vault**.`;
    }

    const topMarks = marks.slice(0, 4).map(m => `• **${m.subject}:** ${m.total}/100 (${m.grade || 'Pending'})`).join('\n');
    return `${topMarks}
• **Summary:** Overall average is **${avgMarks}%** across ${totalSubjects} subjects.
• **Priority:** ${atRisk.length > 0 ? `Strengthen **${atRisk.map(m => m.subject).join(', ')}**.` : 'Maintain current study cadence.'}`;
  }

  // 3. Attendance queries
  if (/(attendance|shortage|bunk|absent|present|classes)/i.test(q)) {
    return `• **Threshold:** 75.0% mandatory baseline.
• **Recovery Rule:** Attend 3 consecutive sessions for every 1 hour missed to restore margin.
• **Tool:** Check the **Attendance Module** in the top bar to calculate safe bunks.`;
  }

  // 4. Exam preparation / Strategy / Revision / Roadmap
  if (/(exam|study|plan|revision|strategy|prepare|target|roadmap|survival|ete|midterm|test)/i.test(q)) {
    return `• **CA Optimization:** Submit remaining internal tasks early to lock maximum weightage.
• **High-Yield Revision:** Focus on previous year problem sets and core formula derivations.
• **Priority Subject:** ${atRisk.length > 0 ? `Dedicate first 45 mins daily to **${atRisk[0].subject}**.` : 'Aim for Grade O by mastering edge-case numericals.'}`;
  }

  // 5. General academic / Conversational default
  return `• **Academic Status:** ${totalSubjects} subjects indexed with **${avgMarks}%** average.
• **Key Focus:** Keep internal CA above 80% to minimize End-Term pressure.
• **Tip:** Ask for specific subject targets or attendance safety calculations.`;
}
