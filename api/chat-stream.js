// api/chat-stream.js — Vercel Serverless: Groq Streaming Proxy for Neural Console
// CommonJS format for maximum Vercel compatibility

module.exports = async function handler(req, res) {
    // ── CORS ─────────────────────────────────────────────────────────────────
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    // ── SSE HEADERS ──────────────────────────────────────────────────────────
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable Nginx buffering on Vercel

    // ── VALIDATE ENV KEY ─────────────────────────────────────────────────────
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
        console.error('[chat-stream] GROQ_API_KEY env var is not set');
        res.write(`data: ${JSON.stringify({ error: 'Server misconfigured: missing API key' })}\n\n`);
        return res.end();
    }

    // ── PARSE BODY ────────────────────────────────────────────────────────────
    let body = req.body;
    if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch { body = {}; }
    }

    const { prompt, context } = body || {};
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
        res.write(`data: ${JSON.stringify({ error: 'Missing prompt' })}\n\n`);
        return res.end();
    }

    // ── BUILD SYSTEM MESSAGE ─────────────────────────────────────────────────
    const systemMessage = context
        ? `You are APIS (Academic Performance Intelligence System), an advanced AI academic advisor for a university student.\nContext about the student:\n${context}\nGuidelines:\n1. Be data-driven and analytical.\n2. Provide actionable advice for academic improvement.\n3. Keep responses concise and well-structured (use markdown).\n4. Use a futuristic, professional, and encouraging tone.\n5. Always reference the student's actual data when available.`
        : 'You are APIS, an advanced AI academic advisor. Be helpful, analytical, and encouraging.';

    // ── CALL GROQ WITH STREAMING ──────────────────────────────────────────────
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
                stream: true,
                temperature: 0.7,
                max_tokens: 1024
            })
        });

        if (!groqRes.ok) {
            const errorText = await groqRes.text();
            console.error('[chat-stream] Groq API error:', groqRes.status, errorText);
            res.write(`data: ${JSON.stringify({ error: `Groq error: ${groqRes.status}` })}\n\n`);
            return res.end();
        }

        // ── STREAM GROQ RESPONSE TO CLIENT ───────────────────────────────────
        const reader = groqRes.body?.getReader();
        const decoder = new TextDecoder();

        if (reader) {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                        try {
                            const data = JSON.parse(line.slice(6));
                            const text = data.choices?.[0]?.delta?.content || '';
                            if (text) {
                                res.write(`data: ${JSON.stringify({ text })}\n\n`);
                            }
                        } catch (e) {
                            // Skip malformed chunk
                        }
                    }
                }
            }
        }

        res.write('data: [DONE]\n\n');
        res.end();

    } catch (err) {
        console.error('[chat-stream] Error:', err.message);
        res.write(`data: ${JSON.stringify({ error: err.message || 'Stream failed' })}\n\n`);
        res.end();
    }
};
