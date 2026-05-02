const express = require('express');
const Student = require('../models/Student');
const { protect } = require('../middleware/authMiddleware');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

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
            const total = (m.ca1||0) + (m.ca2||0) + (m.mte||0) + (m.ete||0);
            ctx += `  ${subj}: CA1=${m.ca1} CA2=${m.ca2} MTE=${m.mte} ETE=${m.ete} → Total=${total}/100\n`;
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

// ── Gemini API call using SDK ────────────────────────────────────────────────
async function askGemini(systemContext, userMessage, apiKey) {
    const genAI = new GoogleGenerativeAI(apiKey);
    const instruction = `You are an LPU Academic Assistant chatbot. You help students with their schedule, marks, attendance, and academic progress. Be concise, friendly, and WhatsApp-formatted (use *bold* for emphasis, avoid markdown headers).

${systemContext}

USER QUESTION: "${userMessage}"

INSTRUCTIONS:
- If they ask about schedule/classes/free time, use the TIMETABLE data including specific times to answer precisely.
- If they ask about progress or comparison between semesters, compare the ACADEMIC HISTORY CGPAs.
- Keep your answer under 150 words.
- If data is missing, say so and suggest syncing with UMS.`;

    let model;
    let result;

    try {
        console.log("Using Gemini model: gemini-1.5-flash");
        model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        result = await model.generateContent(instruction);
    } catch (primaryErr) {
        console.warn("Primary model failed, trying fallback: gemini-1.5-flash-latest", primaryErr.message);
        model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        result = await model.generateContent(instruction);
    }

    const response = await result.response;
    return response.text() || null;
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
        for (const [s, mk] of student.marks) r += `• ${s}: ${(mk.ca1||0)+(mk.ca2||0)+(mk.mte||0)+(mk.ete||0)}/100\n`;
        return r.trim();
    }
    return `👋 Hi ${student.name}! Ask me about your *timetable*, *marks*, or *attendance*.`;
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
            return res.status(404).json({ reply: 'Student not found.' });
        }

        const rawKey = process.env.GEMINI_API_KEY;
        let reply;

        if (rawKey) {
            try {
                const apiKey = rawKey.trim();
                console.log("Initializing Gemini with Key length:", apiKey.length);
                const context = buildStudentContext(student);
                reply = await askGemini(context, message, apiKey);
                if (!reply) throw new Error('Empty response from Gemini');
            } catch (aiErr) {
                console.warn('[Chat] Gemini SDK failed, falling back to keywords:', aiErr.message);
                reply = keywordFallback(message, student);
            }
        } else {
            reply = keywordFallback(message, student);
        }

        res.json({ reply, studentName: student.name, aiPowered: !!rawKey });

    } catch (err) {
        console.error('Chat route error:', err);
        res.status(500).json({ reply: 'Sorry, something went wrong.' });
    }
});

module.exports = router;
