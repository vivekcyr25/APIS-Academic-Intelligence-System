// api/chat.js — Vercel Serverless Function
// Proxies Gemini API calls — keeps the key server-side only

export default async function handler(req, res) {
    // CORS: only allow from your GitHub Pages domain
    const allowedOrigins = [
        'https://vivekcyr25.github.io',
        'http://localhost:3000',
        'http://127.0.0.1:5500'
    ];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const GEMINI_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_KEY) return res.status(500).json({ error: 'Server misconfigured' });

    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string' || prompt.length > 4000) {
        return res.status(400).json({ error: 'Invalid prompt' });
    }

    try {
        const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            }
        );
        if (!geminiRes.ok) {
            const err = await geminiRes.text();
            return res.status(geminiRes.status).json({ error: err });
        }
        const data = await geminiRes.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        return res.status(200).json({ text });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
