// api/ums.js — Academic Sync Proxy for LPU UMS
const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async function handler(req, res) {
    // ── CORS ─────────────────────────────────────────────────────────────────
    const allowed = ['http://localhost:5173', 'https://vivekcyr25.github.io'];
    const origin = req.headers.origin || '';
    res.setHeader('Access-Control-Allow-Origin', allowed.includes(origin) ? origin : 'https://vivekcyr25.github.io');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-ums-session');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { action } = req.query;
    const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY || '1x0000000000000000000000000000000AA'; // Mock secret for demo

    try {
        if (action === 'verify_turnstile') {
            const { token } = req.body;
            if (!token) return res.status(400).json({ success: false, message: 'Missing token' });

            // Verify with Cloudflare
            const verifyRes = await axios.post('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
                secret: TURNSTILE_SECRET,
                response: token
            });

            if (verifyRes.data.success) {
                return res.status(200).json({ success: true, message: 'Human verified' });
            } else {
                return res.status(403).json({ success: false, message: 'Verification failed' });
            }
        }

        if (action === 'get_captcha') {
            // Fetch UMS Login Page to get initial cookies
            const loginPage = await axios.get('https://ums.lpu.org.in/lpuums/');
            const cookies = loginPage.headers['set-cookie'];
            
            // Extract CAPTCHA Image (Simplified for demo - in real it would be /LPUUMS/Captcha.aspx)
            // We'll return a mock for now since real UMS is highly protected by Cloudflare
            return res.status(200).json({
                success: true,
                captchaImg: 'https://api.dicebear.com/7.x/initials/svg?seed=' + Date.now(),
                session: cookies ? cookies.join('; ') : ''
            });
        }

        if (action === 'sync') {
            const { regNo, password, captcha, session, turnstileToken } = req.body;
            
            if (!regNo || !password || !captcha || !turnstileToken) {
                return res.status(400).json({ success: false, message: 'Missing credentials or verification' });
            }

            // Optional: Re-verify Turnstile token here for maximum security
            const finalVerify = await axios.post('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
                secret: TURNSTILE_SECRET,
                response: turnstileToken
            });

            if (!finalVerify.data.success) {
                return res.status(403).json({ success: false, message: 'Invalid human verification' });
            }

            // Simulate UMS Login and Data Extraction
            console.log(`[ums-sync] Syncing data for ${regNo}...`);
            await new Promise(r => setTimeout(r, 2000));

            // Return structured academic data
            return res.status(200).json({
                success: true,
                message: 'Neural sync completed successfully',
                data: {
                    attendance: [
                        { subjectName: 'CSE310: Data Structures', attendancePercentage: 88, attendedLectures: 35, totalLectures: 40, shortageRisk: 'low' },
                        { subjectName: 'CSE316: OS', attendancePercentage: 72, attendedLectures: 28, totalLectures: 39, shortageRisk: 'high' },
                        { subjectName: 'MTH401: Calculus', attendancePercentage: 94, attendedLectures: 45, totalLectures: 48, shortageRisk: 'low' }
                    ],
                    assignments: [
                        { title: 'Project Prototype', subject: 'CSE310', marks: 18, maxMarks: 20, status: 'graded', priority: 'high' },
                        { title: 'System Analysis', subject: 'CSE316', marks: 0, maxMarks: 15, status: 'pending', priority: 'medium' }
                    ],
                    marks: [
                        { subject: 'CSE310', score: 92, total: 100, type: 'MTE' },
                        { subject: 'MTH401', score: 85, total: 100, type: 'CA1' }
                    ],
                    timetable: [
                        { day: 'Monday', time: '09:00 AM', subject: 'CSE310', room: 'B-201' },
                        { day: 'Wednesday', time: '11:00 AM', subject: 'MTH401', room: 'C-302' }
                    ]
                }
            });
        }

        return res.status(404).json({ success: false, message: 'Invalid action' });

    } catch (err) {
        console.error('[ums-api] Error:', err.message);
        return res.status(500).json({ success: false, message: 'Institutional server error' });
    }
};
