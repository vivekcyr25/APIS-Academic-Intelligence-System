import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * APIS AI - Secure Synthesis Proxy
 * Handles Gemini AI requests without exposing API keys to the client.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Diagnostic Logging (Temporary for Stabilization)
  console.log("========== AI ROUTE HEARTBEAT ==========");
  console.log("Timestamp:", new Date().toISOString());
  console.log("Method:", req.method);
  console.log("Environment:", process.env.NODE_ENV || 'development');
  console.log("Has GEMINI_API_KEY:", !!process.env.GEMINI_API_KEY);
  
  // 2. Method Validation
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // 3. Secret Verification
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    console.error('[api/ai] CRITICAL: Missing GEMINI_API_KEY in environment');
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

    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    // 5. Proxy request to Google Gemini with Timeout Handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout for serverless safety

    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: generationConfig || {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok) {
      console.error('[api/ai] Gemini API Error Response:', JSON.stringify(data));
      return res.status(response.status).json({
        success: false,
        error: data?.error?.message || 'Gemini AI synthesis failed',
        code: response.status
      });
    }

    // 6. Return secure response
    return res.status(200).json(data);
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
