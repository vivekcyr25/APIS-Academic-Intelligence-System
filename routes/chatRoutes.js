const express = require('express');
const Student = require('../models/Student');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// ── Helpers ───────────────────────────────────────────────────────────────────
const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

function getTodayName() {
    return DAYS[new Date().getDay()];
}

function formatTimetable(entries, day) {
    if (!entries || entries.length === 0) return `No timetable data found. Sync with UMS first.`;
    const todayClasses = entries.filter(e => e.day === day);
    if (todayClasses.length === 0) return `No classes on ${day}. Enjoy your free day! 🎉`;
    return `📅 *${day}'s Schedule:*\n` +
        todayClasses.map(c => `  • ${c.subject} — ${c.time} (${c.room})`).join('\n');
}

function formatMarks(marks, academicHistory) {
    let reply = '';

    // Current semester marks
    if (marks && marks.size > 0) {
        reply += `📊 *Current Semester Marks:*\n`;
        for (const [subj, m] of marks) {
            const total = m.ca1 + m.ca2 + m.mte + m.ete;
            reply += `  • ${subj}: ${total}/100\n`;
        }
    }

    // Latest historical semester
    if (academicHistory && academicHistory.size > 0) {
        const sems = [...academicHistory.keys()].sort();
        const latest = sems[sems.length - 1];
        const hist = academicHistory.get(latest);
        reply += `\n🎓 *${latest.toUpperCase()} CGPA: ${hist.cgpa}*\n`;
    }

    return reply || 'No marks data available yet.';
}

// ── POST /api/chat ─────────────────────────────────────────────────────────────
// Body: { message: String, regNo: String }
router.post('/', protect, async (req, res) => {
    const { message, regNo } = req.body;
    if (!message || !regNo) {
        return res.status(400).json({ error: 'message and regNo are required.' });
    }

    const msg = message.toLowerCase().trim();

    try {
        const student = await Student.findOne({ regNo }).select('-password');
        if (!student) {
            return res.status(404).json({ reply: "Student not found. Please check your registration number." });
        }

        let reply = '';
        const today = getTodayName();

        // ── Intent Switch ──────────────────────────────────────────────────────
        if (/class|timetable|schedule|lecture/.test(msg)) {
            // Specific day query?
            const dayMatch = DAYS.find(d => msg.includes(d.toLowerCase()));
            const targetDay = dayMatch || today;
            reply = formatTimetable(student.timetable, targetDay);

        } else if (/mark|cgpa|result|grade|score/.test(msg)) {
            reply = formatMarks(student.marks, student.academicHistory);

        } else if (/attendance|present|absent/.test(msg)) {
            const att = parseFloat(student.attendance) || 0;
            const warn = att < 75 ? '\n⚠️ *Warning: Your attendance is below 75%!*' : '\n✅ Attendance is in the safe zone.';
            reply = `📋 *Attendance:* ${student.attendance}${warn}`;

        } else if (/syllabus|topic|curriculum/.test(msg)) {
            if (!student.syllabus || student.syllabus.length === 0) {
                reply = 'No syllabus data. Sync with UMS to fetch it.';
            } else {
                reply = `📚 *Syllabus Summary:*\n` +
                    student.syllabus.map(s => `  • *${s.subjectName}:* ${s.topics}`).join('\n');
            }

        } else if (/sync|update|refresh/.test(msg)) {
            reply = student.umsSynced
                ? `🔄 Last synced: ${student.lastSyncDate ? new Date(student.lastSyncDate).toLocaleDateString() : 'Unknown'}.\nUse the dashboard Sync button to update again.`
                : `❌ UMS data not yet synced. Use the "Sync with UMS" button on the dashboard.`;

        } else if (/hello|hi|hey|help/.test(msg)) {
            reply = `👋 Hi ${student.name}! I'm your LPU Academic Assistant.\n\nI can help you with:\n  • 📅 Timetable / Schedule\n  • 📊 Marks & CGPA\n  • 📋 Attendance\n  • 📚 Syllabus\n\nWhat do you need?`;

        } else {
            reply = `I can help you with your *timetable*, *marks*, or *attendance*. What do you need?\n\nTry: "What are my classes today?" or "Show my marks"`;
        }

        res.json({ reply, studentName: student.name });

    } catch (err) {
        console.error('Chat route error:', err);
        res.status(500).json({ reply: 'Sorry, something went wrong. Please try again.' });
    }
});

module.exports = router;
