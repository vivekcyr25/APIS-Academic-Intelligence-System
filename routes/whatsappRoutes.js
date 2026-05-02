/**
 * whatsappRoutes.js — Twilio WhatsApp Webhook
 *
 * Prerequisites:
 *   npm install twilio
 *   Set in .env / Render environment:
 *     TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 *     TWILIO_AUTH_TOKEN=your_auth_token
 *     TWILIO_WHATSAPP_FROM=whatsapp:+14155238886   (Twilio sandbox number)
 *
 * Twilio Sandbox Setup:
 *   1. Go to https://console.twilio.com → Messaging → Try it out → WhatsApp
 *   2. Set Webhook URL to: https://your-render-url.onrender.com/api/whatsapp/webhook
 *   3. Method: POST
 *   4. Students connect by sending "join <sandbox-keyword>" to +1 415 523 8886 on WhatsApp
 */

const express  = require('express');
const Student  = require('../models/Student');
const router   = express.Router();

// Load Twilio SDK safely (won't crash if not installed)
let twilioClient;
try {
    const twilio = require('twilio');
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        console.log('✅ Twilio client initialized.');
    } else {
        console.warn('⚠️  TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN not set. WhatsApp replies disabled.');
    }
} catch (e) {
    console.warn('⚠️  Twilio SDK not installed. Run: npm install twilio');
}

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

function getTodayName() { return DAYS[new Date().getDay()]; }

function buildReply(msg, student) {
    const m = msg.toLowerCase();

    if (/class|timetable|schedule|lecture/.test(m)) {
        const dayMatch  = DAYS.find(d => m.includes(d.toLowerCase()));
        const targetDay = dayMatch || getTodayName();
        const classes   = (student.timetable || []).filter(e => e.day === targetDay);
        if (classes.length === 0) return `No classes on ${targetDay}. 🎉`;
        return `📅 *${targetDay}:*\n` + classes.map(c => `• ${c.subject} — ${c.time} (${c.room})`).join('\n');
    }

    if (/mark|cgpa|result|grade|score/.test(m)) {
        if (!student.marks || student.marks.size === 0) return 'No marks data yet. Try syncing with UMS.';
        let reply = '📊 *Current Marks:*\n';
        for (const [subj, mk] of student.marks) {
            reply += `• ${subj}: ${mk.ca1 + mk.ca2 + mk.mte + mk.ete}/100\n`;
        }
        return reply.trim();
    }

    if (/attendance|present|absent/.test(m)) {
        const att  = parseFloat(student.attendance) || 0;
        const warn = att < 75 ? '\n⚠️ *Below 75%! Attend more classes.*' : '\n✅ Safe zone.';
        return `📋 Attendance: *${student.attendance}*${warn}`;
    }

    if (/syllabus|topic/.test(m)) {
        if (!student.syllabus || student.syllabus.length === 0) return 'No syllabus data. Sync with UMS first.';
        return '📚 *Syllabus:*\n' + student.syllabus.map(s => `• *${s.subjectName}:* ${s.topics}`).join('\n');
    }

    if (/hello|hi|hey|help/.test(m)) {
        return `👋 Hi ${student.name}! I'm your LPU Bot.\n\nI can help with:\n• Timetable\n• Marks & CGPA\n• Attendance\n• Syllabus\n\nJust ask!`;
    }

    return `I can help with your *timetable*, *marks*, or *attendance*. What do you need?`;
}

/**
 * POST /api/whatsapp/webhook
 * Twilio sends: Body (message text), From (sender's WhatsApp number)
 */
router.post('/webhook', express.urlencoded({ extended: false }), async (req, res) => {
    const incomingMsg = req.body.Body   || '';
    const fromNumber  = req.body.From   || ''; // e.g. "whatsapp:+919876543210"
    const toNumber    = req.body.To     || process.env.TWILIO_WHATSAPP_FROM || '';

    console.log(`[WhatsApp] Message from ${fromNumber}: "${incomingMsg}"`);

    let replyText = '';

    try {
        // Identify student by phone number (strip "whatsapp:" prefix)
        const phone = fromNumber.replace('whatsapp:', '');
        const student = await Student.findOne({ phoneNumber: phone }).select('-password');

        if (!student) {
            replyText = `❌ Your number (${phone}) is not linked to any student account.\n\nAsk your admin to link your WhatsApp number in the portal.`;
        } else {
            replyText = buildReply(incomingMsg, student);
        }

    } catch (err) {
        console.error('[WhatsApp] Error:', err.message);
        replyText = 'Sorry, something went wrong. Please try again later.';
    }

    // Send reply via Twilio
    if (twilioClient && toNumber) {
        try {
            await twilioClient.messages.create({
                body: replyText,
                from: toNumber,
                to:   fromNumber
            });
            console.log(`[WhatsApp] Reply sent to ${fromNumber}`);
        } catch (twilioErr) {
            console.error('[WhatsApp] Twilio send error:', twilioErr.message);
        }
    } else {
        console.log('[WhatsApp] (Twilio not configured) Reply would be:', replyText);
    }

    // Twilio expects 200 OK
    res.status(200).send('<Response></Response>');
});

module.exports = router;
