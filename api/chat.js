// api/chat.js — Vercel Serverless Proxy for Gemini
// CommonJS format for maximum Vercel compatibility

module.exports = async function handler(req, res) {
    // ── CORS ─────────────────────────────────────────────────────────────────
    const allowed = ['https://vivekcyr25.github.io', 'http://localhost:3000', 'http://127.0.0.1:5500'];
    const origin = req.headers.origin || '';
    res.setHeader('Access-Control-Allow-Origin', allowed.includes(origin) ? origin : 'https://vivekcyr25.github.io');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Vary', 'Origin');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

    // ── VALIDATE ENV KEY ─────────────────────────────────────────────────────
    const GEMINI_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_KEY) {
        console.error('[chat] GEMINI_API_KEY env var is not set');
        return res.status(500).json({ success: false, message: 'Server misconfigured: missing API key' });
    }

    // ── PARSE BODY ────────────────────────────────────────────────────────────
    let body = req.body;
    if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch { body = {}; }
    }
    console.log('[chat] incoming body:', JSON.stringify(body).slice(0, 200));

    const { prompt } = body || {};
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid request: prompt must be a non-empty string' });
    }
    if (prompt.length > 8000) {
        return res.status(400).json({ success: false, message: 'Prompt too long (max 8000 chars)' });
    }

    // ── CALL GEMINI ───────────────────────────────────────────────────────────
    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;
    const payload = {
        contents: [{ parts: [{ text: prompt.trim() }] }],
        generationConfig: { maxOutputTokens: 512, temperature: 0.7 }
    };

    console.log('[chat] calling Gemini with prompt length:', prompt.length);

    try {
        const geminiRes = await fetch(GEMINI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const rawText = await geminiRes.text();
        console.log('[chat] Gemini status:', geminiRes.status, '| raw:', rawText.slice(0, 300));

        if (!geminiRes.ok) {
            return res.status(geminiRes.status).json({ success: false, message: `Gemini error ${geminiRes.status}: ${rawText}` });
        }

        const data = JSON.parse(rawText);
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        return res.status(200).json({ success: true, text });

    } catch (err) {
        console.error('[chat] fetch error:', err.message);
        return res.status(500).json({ success: false, message: `Network error: ${err.message}` });
    }
};
