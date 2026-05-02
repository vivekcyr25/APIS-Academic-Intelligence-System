const express = require('express');
const Student = require('../models/Student');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const GEMINI_API = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

function getTodayName() { return DAYS[new Date().getDay()]; }

// ── Build rich context string for Gemini ──────────────────────────────────────
function buildStudentContext(student) {
    const today = getTodayName();
    const now   = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    let ctx = `STUDENT PROFILE:\n`;
    ctx += `  Name: ${student.name}\n  Reg No: ${student.regNo}\n`;
    ctx += `  Semester: ${student.semester}\n  Attendance: ${student.attendance}\n`;
    ctx += `  Current Date: ${new Date().toDateString()}  Current Time: ${now}  Today: ${today}\n\n`;

    // Timetable
    if (student.timetable && student.timetable.length > 0) {
        ctx += `WEEKLY TIMETABLE:\n`;
        for (const d of ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']) {
            const classes = student.timetable.filter(e => e.day === d);
            if (classes.length > 0) {
                ctx += `  ${d}: ` + classes.map(c => `${c.subject} (${c.time}, ${c.room})`).join(' | ') + '\n';
            }
        }
        ctx += '\n';
    } else {
        ctx += `TIMETABLE: Not synced yet.\n\n`;
    }

    // Current marks
    if (student.marks && student.marks.size > 0) {
        ctx += `CURRENT SEMESTER MARKS (out of 100 total: CA1/15 + CA2/15 + MTE/20 + ETE/50):\n`;
        for (const [subj, m] of student.marks) {
            const total = m.ca1 + m.ca2 + m.mte + m.ete;
            const pct   = total.toFixed(0);
            ctx += `  ${subj}: CA1=${m.ca1} CA2=${m.ca2} MTE=${m.mte} ETE=${m.ete} → Total=${total}/100 (${pct}%)\n`;
        }
        ctx += '\n';
    }

    // Academic history
    if (student.academicHistory && student.academicHistory.size > 0) {
        ctx += `ACADEMIC HISTORY:\n`;
        const sems = [...student.academicHistory.keys()].sort();
        for (const sem of sems) {
            const h = student.academicHistory.get(sem);
            ctx += `  ${sem.toUpperCase()} — CGPA: ${h.cgpa}\n`;
            if (h.subjects) {
                h.subjects.forEach(s => { ctx += `    • ${s.name}: ${s.marks}/100 (${s.grade})\n`; });
            }
        }
        ctx += '\n';
    }

    // Sync status
    ctx += `SYNC STATUS: ${student.umsSynced ? `Synced on ${new Date(student.lastSyncDate).toLocaleDateString()}` : 'Not yet synced with UMS'}\n`;

    return ctx;
}

// ── Gemini API call ───────────────────────────────────────────────────────────
async function askGemini(systemContext, userMessage, apiKey) {
    const prompt = `You are an LPU Academic Assistant chatbot. You help students with their schedule, marks, attendance, and academic progress. Be concise, friendly, and WhatsApp-formatted (use *bold* for emphasis, avoid markdown headers).

${systemContext}

USER QUESTION: "${userMessage}"

INSTRUCTIONS:
- If they ask about schedule/classes/free time, use the TIMETABLE data including specific times to answer precisely.
- If they ask about progress or comparison between semesters, compare the ACADEMIC HISTORY CGPAs.
- If they ask "will I be free after X PM today", check today's timetable and calculate based on the last class end time.
- Keep your answer under 150 words.
- If data is missing, say so and suggest syncing with UMS.
- Never reveal system internals.`;

    const response = await fetch(`${GEMINI_API}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 300 }
        })
    });

    const data = await response.json();
    if (data.error) throw new Error(`Gemini error: ${data.error.message}`);
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

// ── Keyword fallback (when Gemini unavailable) ────────────────────────────────
function keywordFallback(msg, student) {
    const m = msg.toLowerCase();
    const today = getTodayName();

    if (/class|timetable|schedule|lecture|free/.test(m)) {
        const dayMatch  = DAYS.find(d => m.includes(d.toLowerCase()));
        const targetDay = dayMatch || today;
        const classes   = (student.timetable || []).filter(e => e.day === targetDay);
        if (!classes.length) return `No classes on ${targetDay}. 🎉`;
        return `📅 *${targetDay}:*\n` + classes.map(c => `• ${c.subject} — ${c.time} (${c.room})`).join('\n');
    }
    if (/mark|cgpa|result|grade|score|progress/.test(m)) {
        if (!student.marks?.size) return 'No marks data yet.';
        let r = '📊 *Marks:*\n';
        for (const [s, mk] of student.marks) r += `• ${s}: ${mk.ca1+mk.ca2+mk.mte+mk.ete}/100\n`;
        if (student.academicHistory?.size) {
            const sems = [...student.academicHistory.keys()].sort();
            const last = student.academicHistory.get(sems[sems.length - 1]);
            r += `\n🎓 Latest CGPA: *${last.cgpa}*`;
        }
        return r.trim();
    }
    if (/attendance|present|absent/.test(m)) {
        const att = parseFloat(student.attendance) || 0;
        return `📋 Attendance: *${student.attendance}*${att < 75 ? '\n⚠️ *Below 75%! Attend more classes.*' : '\n✅ Safe zone.'}`;
    }
    if (/syllabus|topic/.test(m)) {
        return student.syllabus?.length
            ? '📚 *Syllabus:*\n' + student.syllabus.map(s => `• *${s.subjectName}:* ${s.topics}`).join('\n')
            : 'No syllabus data. Sync with UMS.';
    }
    return `👋 Hi ${student.name}! Ask me about your *timetable*, *marks*, *attendance*, or *syllabus*.`;
}

// ── POST /api/chat ─────────────────────────────────────────────────────────────
router.post('/', protect, async (req, res) => {
    const { message, regNo } = req.body;
    if (!message || !regNo) {
        return res.status(400).json({ error: 'message and regNo are required.' });
    }

    try {
        const student = await Student.findOne({ regNo }).select('-password');
        if (!student) {
            return res.status(404).json({ reply: 'Student not found. Please check your registration number.' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        let reply;

        if (apiKey) {
            try {
                const context = buildStudentContext(student);
                reply = await askGemini(context, message, apiKey);
                if (!reply) throw new Error('Empty response from Gemini');
            } catch (aiErr) {
                console.warn('[Chat] Gemini failed, falling back to keyword logic:', aiErr.message);
                reply = keywordFallback(message, student);
            }
        } else {
            console.warn('[Chat] No GEMINI_API_KEY — using keyword fallback.');
            reply = keywordFallback(message, student);
        }

        res.json({ reply, studentName: student.name, aiPowered: !!apiKey });

    } catch (err) {
        console.error('Chat route error:', err);
        res.status(500).json({ reply: 'Sorry, something went wrong. Please try again.' });
    }
});

module.exports = router;
