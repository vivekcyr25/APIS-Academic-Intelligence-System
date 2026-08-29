import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    res.write(`data: ${JSON.stringify({ error: 'Server misconfigured: missing API key' })}\n\n`);
    return res.end();
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  const { prompt, context } = body || {};
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    res.write(`data: ${JSON.stringify({ error: 'Missing prompt' })}\n\n`);
    return res.end();
  }

  // ── Explicit / Inappropriate Content Safety Guardrail ──
  const EXPLICIT_PATTERN = /\b(sex|sexual|porn|pornography|nude|nudity|nsfw|erotic|orgasm|masturbat|fetish|boobs|penis|vagina|intercourse|stripper|blowjob|hookup|hentai|xxx|kill\s+yourself|suicide|self-harm|bomb\s+making|terrorist|weapon\s+assembly|rape|molest|bitch|slut|whore|motherfucker|cock|cunt)\b/i;
  const SAFETY_REFUSAL_MESSAGE = "Sorry, I can't answer that. What can I help you with regarding any other request?";

  if (EXPLICIT_PATTERN.test(prompt)) {
    res.write(`data: ${JSON.stringify({ text: SAFETY_REFUSAL_MESSAGE })}\n\n`);
    res.write('data: [DONE]\n\n');
    return res.end();
  }

  const systemMessage = context
    ? `You are APIS (Academic Performance Intelligence System), a sharp and ultra-concise AI academic advisor.
Student Context:
${context}

CRITICAL FORMATTING & LENGTH RULES:
1. POINT-TO-POINT ONLY: Output strictly 2 to 4 short bullet points. Total response MUST be under 100 words.
2. NO TABLES: NEVER output markdown tables, grids, or multi-column structures.
3. NO LONG PARAGRAPHS OR ESSAYS: Strictly no multi-section breakdowns, long introductions, or filler text.
4. DIRECT & ACTIONABLE: Highlight the core score and exact next step immediately.
5. SAFETY REFUSAL: If asked anything sexually explicit, inappropriate, harmful, or non-academic violations, reply ONLY with: "${SAFETY_REFUSAL_MESSAGE}".`
    : `You are APIS, a concise AI academic advisor.
CRITICAL RULES:
1. POINT-TO-POINT ONLY: Output strictly 2 to 4 short bullet points (under 80 words total).
2. NO TABLES, NO ESSAYS, NO FLUFF: Answer directly and crisply.
3. SAFETY REFUSAL: If asked anything sexually explicit, inappropriate, or harmful, reply ONLY with: "${SAFETY_REFUSAL_MESSAGE}".`;

  try {
    const model = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt.trim() },
        ],
        stream: true,
        temperature: 0.4,
        max_tokens: 250,
      }),
    });

    if (!groqRes.ok) {
      const errorText = await groqRes.text();
      console.error('[chat-stream] Groq API error:', groqRes.status, errorText);
      res.write(`data: ${JSON.stringify({ error: `Groq error: ${groqRes.status}` })}\n\n`);
      return res.end();
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
              const text = data.choices?.[0]?.delta?.content || '';
              if (text) {
                res.write(`data: ${JSON.stringify({ text })}\n\n`);
              }
            } catch {
              // Skip malformed chunk
            }
          }
        }
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Stream failed';
    console.error('[chat-stream] Error:', message);
    res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
    res.end();
  }
}
