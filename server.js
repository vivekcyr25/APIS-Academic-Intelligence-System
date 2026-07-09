import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Safely load the ES Module API handler
let umsSyncHandler = null;
try {
    const module = await import('./api/ums-sync.js');
    umsSyncHandler = module.default;
} catch (e) {
    console.error('[server] Failed to load ums-sync.js:', e);
}

app.post('/api/ums-sync', async (req, res) => {
    console.log(`[server] POST /api/ums-sync | Action: ${req.body?.action}`);
    
    try {
        if (typeof umsSyncHandler === 'function') {
            await umsSyncHandler(req, res);
        } else {
            console.error('[server] UMS handler is not a function!');
            res.status(500).json({ success: false, message: 'API Handler Configuration Error' });
        }
    } catch (err) {
        console.error('[server] Handler Error:', err);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: 'Internal Server Sync Error' });
        }
    }
});

// Health Check Endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        provider: 'groq',
        model: 'llama-3.3-70b-versatile',
        online: true
    });
});

// Legacy Gemini Proxy endpoint rewritten for Groq
// This handles aiService.ts requests (askAI, processAcademicImage, etc.)
app.post('/api/ai', async (req, res) => {
    try {
        const GROQ_API_KEY = process.env.GROQ_API_KEY;
        if (!GROQ_API_KEY) {
            return res.status(500).json({ error: 'Backend key missing' });
        }

        // Parse Gemini-style request body
        const body = req.body;
        const prompt = body.contents?.[0]?.parts?.[0]?.text || '';
        const temp = body.generationConfig?.temperature || 0.7;
        const maxTokens = body.generationConfig?.maxOutputTokens || 1024;

        if (!prompt) {
            return res.status(400).json({ error: 'Missing prompt' });
        }

        // Send to Groq
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: prompt }],
                temperature: temp,
                max_tokens: maxTokens
            })
        });

        const data = await groqRes.json();
        
        if (!groqRes.ok) {
            return res.status(groqRes.status).json({ error: data.error?.message || 'Groq AI failed' });
        }

        const aiText = data.choices[0]?.message?.content || '';

        // Return Gemini-style response for frontend compatibility
        res.status(200).json({
            candidates: [
                {
                    content: {
                        parts: [{ text: aiText }]
                    }
                }
            ]
        });

    } catch (err) {
        console.error('[server] /api/ai Error:', err);
        res.status(500).json({ error: 'Internal system error' });
    }
});

// Groq AI Streaming Endpoint
app.post('/api/chat-stream', async (req, res) => {
    const { prompt, context } = req.body;
    
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    try {
        const GROQ_API_KEY = process.env.GROQ_API_KEY;
        if (!GROQ_API_KEY) {
            throw new Error('GROQ_API_KEY is missing in backend environment');
        }

        const systemMessage = `You are APIS (Academic Performance Intelligence System), an advanced AI academic advisor for a university student.
Context about the student:
${context || 'No specific context provided.'}

Guidelines:
1. Be data-driven and analytical.
2. Provide actionable advice for academic improvement.
3. Keep responses concise and well-structured.
4. Use a futuristic, professional, and encouraging tone.
5. Always reference the student's actual data when available.`;

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
                    { role: 'user', content: prompt }
                ],
                stream: true,
                temperature: 0.7,
                max_tokens: 1024
            })
        });

        if (!groqRes.ok) {
            const errorText = await groqRes.text();
            throw new Error(`Groq API error: ${groqRes.status} ${errorText}`);
        }

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
                            const text = data.choices[0]?.delta?.content || '';
                            if (text) {
                                res.write(`data: ${JSON.stringify({ text })}\n\n`);
                            }
                        } catch (e) {
                            console.error('[server] Parse error on chunk:', e);
                        }
                    }
                }
            }
        }
        res.write('data: [DONE]\n\n');
        res.end();
    } catch (err) {
        console.error('[server] Streaming Error:', err);
        res.write(`data: ${JSON.stringify({ error: err.message || 'Stream failed' })}\n\n`);
        res.end();
    }
});
app.listen(PORT, () => {
    console.log(`[backend] Academic Sync Server running at http://localhost:${PORT}`);
    console.log(`[backend] Logical routes mapped to api/ums-sync.js`);
});
