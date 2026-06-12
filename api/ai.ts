import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * APIS AI - Secure Synthesis Proxy
 * Handles Gemini AI requests without exposing API keys to the client.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 0. CORS — Allow GitHub Pages and any frontend to call this function
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. Diagnostic Logging (Temporary for Stabilization)
  console.log("========== AI ROUTE HEARTBEAT ==========");
  console.log("Timestamp:", new Date().toISOString());
  console.log("Method:", req.method);
  console.log("Environment:", process.env.NODE_ENV || 'development');
  console.log("Has GROQ_API_KEY:", !!process.env.GROQ_API_KEY);
  
  // 2. Method Validation
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }


  // 3. Secret Verification
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    console.error('[api/ai] CRITICAL: Missing GROQ_API_KEY in environment');
    return res.status(500).json({ 
      success: false, 
      error: 'AI infrastructure misconfigured. Backend key missing.',
      diagnostic: { env: process.env.NODE_ENV }
    });
  }

  try {
    // 4. Body Extraction (Handling potential parsing edge cases in serverless runtimes)
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { contents, generationConfig } = body || {};

    if (!contents) {
      console.warn('[api/ai] Bad Request: Missing contents payload');
      return res.status(400).json({ success: false, error: 'Missing content payload' });
    }

    const prompt = contents[0]?.parts?.[0]?.text || '';
    const temp = generationConfig?.temperature || 0.7;
    const maxTokens = generationConfig?.maxOutputTokens || 1024;

    // 5. Proxy request to Google Gemini with Timeout Handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout for serverless safety

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok) {
      console.error('[api/ai] Groq API Error Response:', JSON.stringify(data));
      return res.status(response.status).json({
        success: false,
        error: data?.error?.message || 'Groq AI synthesis failed',
        code: response.status
      });
    }

    const aiText = data.choices[0]?.message?.content || '';

    // Return Gemini-style response for frontend compatibility
    return res.status(200).json({
        candidates: [
            {
                content: {
                    parts: [{ text: aiText }]
                }
            }
        ]
    });
  } catch (error) {
    console.error('[api/ai] Fatal Proxy Exception:', error);
    const isTimeout = error instanceof Error && error.name === 'AbortError';
    
    return res.status(isTimeout ? 504 : 500).json({ 
      success: false, 
      error: isTimeout ? 'AI synthesis timed out' : 'Internal system error during intelligence synthesis',
      technical: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
}
