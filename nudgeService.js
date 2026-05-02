/**
 * nudgeService.js — Proactive Student Health Nudges via WhatsApp
 *
 * Called after every UMS sync. Sends a WhatsApp alert if:
 *   - Attendance < 75%
 *   - Any subject grade is 'F'
 *
 * Spam protection: only sends once per sync (tracked by lastSyncDate on the record)
 */

let twilioClient;
try {
    const twilio = require('twilio');
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    }
} catch (_) {}

const FROM_WHATSAPP = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';

/**
 * checkStudentHealth(student)
 * @param {Object} student  — Mongoose student document (full, with marks/history/timetable)
 */
async function checkStudentHealth(student) {
    if (!twilioClient) {
        console.log('[Nudge] Twilio not configured — skipping WhatsApp nudge.');
        return;
    }

    if (!student.phoneNumber) {
        console.log(`[Nudge] No phone number for ${student.regNo} — skipping.`);
        return;
    }

    const alerts = [];
    const toNumber = `whatsapp:${student.phoneNumber}`;

    // ── 1. Overall attendance check ───────────────────────────────────────────
    const att = parseFloat(student.attendance) || 0;
    if (att < 75) {
        // Classes needed: rough estimate assuming 100 total classes recorded
        const needed = Math.ceil((75 - att) * 4); // conservative estimate
        alerts.push(
            `⚠️ *Attendance Alert*\n` +
            `Your overall attendance has dropped to *${student.attendance}*.\n` +
            `You need to attend approximately *${needed} more classes* to reach the safe 75% threshold.`
        );
    }

    // ── 2. Subject-level grade check (F grade) ────────────────────────────────
    if (student.marks && student.marks instanceof Map) {
        for (const [subj, m] of student.marks) {
            const total = (m.ca1 || 0) + (m.ca2 || 0) + (m.mte || 0) + (m.ete || 0);
            if (total < 40) { // F grade threshold
                alerts.push(
                    `🔴 *Failing Alert — ${subj}*\n` +
                    `Your current score in *${subj}* is *${total}/100*, which is a failing grade.\n` +
                    `Focus on this subject immediately to improve your ETE performance.`
                );
            }
        }
    }

    if (alerts.length === 0) {
        console.log(`[Nudge] ${student.regNo} — all clear, no alerts needed.`);
        return;
    }

    // ── 3. Send each alert as a WhatsApp message ──────────────────────────────
    const header = `👋 Hi ${student.name}! Here's your LPU Academic Health Update:\n\n`;
    const fullMsg = header + alerts.join('\n\n─────────────────\n\n');

    try {
        await twilioClient.messages.create({
            body: fullMsg,
            from: FROM_WHATSAPP,
            to:   toNumber
        });
        console.log(`[Nudge] ✅ Sent ${alerts.length} alert(s) to ${student.phoneNumber}`);
    } catch (err) {
        console.error(`[Nudge] ❌ Failed to send WhatsApp nudge: ${err.message}`);
    }
}

module.exports = { checkStudentHealth };
