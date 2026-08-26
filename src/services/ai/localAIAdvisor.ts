import type { MarkRecord } from '../marks/marksService';
import type { Semester, AcademicProfile } from '../../types/academic-v2';

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
      return `Hello ${studentName}! I am your APIS Academic Intelligence Assistant.

I am connected to your Academic Vault. Currently, you haven't synced any semester marks or attendance records yet.

**Here is what you can do:**
1. Head to the **Upload Center** to upload screenshots of your marks, attendance, or CA sheets.
2. Visit the **Semester Vault** to configure your current curriculum.
3. Ask me anytime for CA target projections, subject risk analysis, or custom revision schedules!`;
    }

    return `Greetings, ${studentName}! Your Academic Intelligence Engine is active and synchronized.

📊 **Current Performance Snapshot:**
- **Indexed Subjects:** ${totalSubjects} courses
- **Average Performance:** ${avgMarks}%
${atRisk.length > 0 ? `⚠️ **Attention Needed:** ${atRisk.map(m => m.subject).join(', ')}` : '✨ **Status:** All tracked subjects are in a stable trajectory.'}

How can I assist you with your exam targets, revision planning, or subject strategies today?`;
  }

  // 2. Marks, Grades, or GPA queries
  if (/(mark|grade|score|sgpa|cgpa|gpa|percentage|result|performance)/i.test(q)) {
    if (totalSubjects === 0) {
      return `📊 **Academic Performance Analysis:**

No subject records were found in your local vault. Please upload your marks via the **Upload Center** or add them in the **Semester Vault** to enable deep GPA and CA tracking.`;
    }

    const marksList = marks.map(m => `• **${m.subject}:** ${m.total}/100 (${m.grade || 'Grade Pending'})`).join('\n');
    return `📊 **Longitudinal Performance Evaluation for ${studentName}:**

${marksList}

📈 **Synthesis:**
- **Overall Average:** ${avgMarks}%
- **Strongest Disciplines:** ${highScoring.length > 0 ? highScoring.map(m => m.subject).join(', ') : 'Building momentum'}
- **Focus Recommendation:** ${atRisk.length > 0 ? `Prioritize reinforcement in **${atRisk.map(m => m.subject).join(', ')}** to safeguard your semester GPA.` : 'Maintain current cadence across all lab and theory modules.'}`;
  }

  // 3. Attendance queries
  if (/(attendance|shortage|bunk|absent|present|classes)/i.test(q)) {
    return `🛡️ **Attendance & Compliance Radar:**

- **Standard Threshold:** 75.0% Mandatory Academic Baseline
- **Optimization Strategy:** For every 1 hour of absence, ensure at least 3 consecutive attended sessions to recover baseline percentage.
- **Real-Time Tracking:** Check the dedicated **Attendance Module** in the navigation bar to simulate class bunker margins and medical leave allowances.`;
  }

  // 4. Exam preparation / Strategy / Revision / Roadmap
  if (/(exam|study|plan|revision|strategy|prepare|target|roadmap|survival|ete|midterm|test)/i.test(q)) {
    return `🧠 **Strategic Academic Action Plan for ${studentName}:**

1. **High-Yield CA Optimization (Continuous Assessment):**
   - Ensure all pending assignments in your queue are submitted at least 24 hours prior to deadline to earn maximum internal weightage.

2. **Targeted Revision Cycle:**
   - **Phase 1 (Concepts):** Consolidate core lecture slide notes into high-density summaries.
   - **Phase 2 (Problem Solving):** Focus on previous semester question patterns and numerical problem sets.
   - **Phase 3 (Active Recall):** Test yourself without looking at solutions 48 hours before examination.

3. **Risk Mitigation:**
   ${atRisk.length > 0 
     ? `Focus first on **${atRisk.map(m => m.subject).join(', ')}** where CA marks need immediate boost.` 
     : 'Your internal metrics are strong. Aim for Grade A+ / O by focusing on end-term comprehensive theory.'}

Would you like a custom 7-day daily study roadmap for any specific subject?`;
  }

  // 5. General academic / Conversational default
  return `🤖 **APIS Neural Academic Intelligence:**

I have evaluated your query: *"${query}"*.

**Academic Guidance for ${studentName}:**
- **Vault Status:** ${totalSubjects} subjects monitored with average score of ${avgMarks}%.
- **Trajectory:** Continuously keep your CA scores above 80% to lower the pressure on End-Term Exams (ETE).
- **Next Step:** You can ask me to calculate required ETE marks for an 'A' grade, generate a study timetable, or analyze attendance safety margins!`;
}
