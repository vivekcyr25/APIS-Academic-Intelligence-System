// api/chat.js — Vercel Serverless Proxy for Groq AI
// CommonJS format for maximum Vercel compatibility

export default async function handler(req, res) {
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

    // ── Explicit / Inappropriate Content Safety Guardrail ──
    const EXPLICIT_PATTERN = /\b(sex|sexual|porn|pornography|nude|nudity|nsfw|erotic|orgasm|masturbat|fetish|boobs|penis|vagina|intercourse|stripper|blowjob|hookup|hentai|xxx|kill\s+yourself|suicide|self-harm|bomb\s+making|terrorist|weapon\s+assembly|rape|molest|bitch|slut|whore|motherfucker|cock|cunt)\b/i;
    const SAFETY_REFUSAL_MESSAGE = "Sorry, I can't answer that. What can I help you with regarding any other request?";

    if (EXPLICIT_PATTERN.test(prompt)) {
        return res.status(200).json({ success: true, text: SAFETY_REFUSAL_MESSAGE });
    }

    // ── CALL GROQ ────────────────────────────────────────────────────────────
    const systemMessage = context
        ? `You are APIS (Academic Performance Intelligence System), an ultra-concise AI academic advisor.\nContext about the student:\n${context}\nSTRICT RULES:\n1. POINT-TO-POINT ONLY: Output strictly 2 to 4 short bullet points (under 100 words total).\n2. NO TABLES: Never generate markdown tables or multi-column grids.\n3. NO ESSAYS OR FLUFF: Be completely direct.\n4. SAFETY REFUSAL: If asked anything sexually explicit, inappropriate, or harmful, reply ONLY with: "${SAFETY_REFUSAL_MESSAGE}".`
        : `You are APIS, a concise AI academic advisor.\nSTRICT RULES:\n1. POINT-TO-POINT ONLY: Output strictly 2 to 4 bullet points (under 80 words total).\n2. NO TABLES, NO ESSAYS, NO FLUFF.\n3. SAFETY REFUSAL: If asked anything sexually explicit or inappropriate, reply ONLY with: "${SAFETY_REFUSAL_MESSAGE}".`;

    console.log('[chat] calling Groq with prompt length:', prompt.length);

    try {
        const model = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model,
                messages: [
                    { role: 'system', content: systemMessage },
                    { role: 'user', content: prompt.trim() }
                ],
                temperature: 0.4,
                max_tokens: 220
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
