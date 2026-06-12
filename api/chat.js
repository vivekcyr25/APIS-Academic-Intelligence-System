// api/chat.js — Vercel Serverless Proxy for Groq AI
// CommonJS format for maximum Vercel compatibility

module.exports = async function handler(req, res) {
    // ── CORS ─────────────────────────────────────────────────────────────────
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

    // ── VALIDATE ENV KEY ─────────────────────────────────────────────────────
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
        console.error('[chat] GROQ_API_KEY env var is not set');
        return res.status(500).json({ success: false, message: 'Server misconfigured: missing API key' });
    }

    // ── PARSE BODY ────────────────────────────────────────────────────────────
    let body = req.body;
    if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch { body = {}; }
    }
    console.log('[chat] incoming body:', JSON.stringify(body).slice(0, 200));

    const { prompt, context } = body || {};
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid request: prompt must be a non-empty string' });
    }
    if (prompt.length > 8000) {
        return res.status(400).json({ success: false, message: 'Prompt too long (max 8000 chars)' });
    }

    // ── CALL GROQ ────────────────────────────────────────────────────────────
    const systemMessage = context
        ? `You are APIS (Academic Performance Intelligence System), an advanced AI academic advisor.\nContext about the student:\n${context}\nGuidelines:\n1. Be data-driven and analytical.\n2. Provide actionable advice for academic improvement.\n3. Keep responses concise and well-structured.\n4. Use a futuristic, professional, and encouraging tone.`
        : 'You are APIS, an AI academic advisor. Be helpful, concise, and professional.';

    console.log('[chat] calling Groq with prompt length:', prompt.length);

    try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: systemMessage },
                    { role: 'user', content: prompt.trim() }
                ],
                temperature: 0.7,
                max_tokens: 512
            })
        });

        const rawText = await groqRes.text();
        console.log('[chat] Groq status:', groqRes.status, '| raw:', rawText.slice(0, 300));

        if (!groqRes.ok) {
            return res.status(groqRes.status).json({ success: false, message: `Groq error ${groqRes.status}: ${rawText}` });
        }

        const data = JSON.parse(rawText);
        const text = data?.choices?.[0]?.message?.content || '';
        return res.status(200).json({ success: true, text });

    } catch (err) {
        console.error('[chat] fetch error:', err.message);
        return res.status(500).json({ success: false, message: `Network error: ${err.message}` });
    }
};
