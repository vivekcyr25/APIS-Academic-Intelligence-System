import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * APIS AI - Secure Turnstile Verification
 * Verifies Cloudflare Turnstile tokens server-side.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;
  if (!TURNSTILE_SECRET_KEY) {
    console.error('[api/verify] Missing TURNSTILE_SECRET_KEY');
    return res.status(500).json({ error: 'Security infrastructure misconfigured' });
  }

  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Missing verification token' });
    }

    const verifyUrl = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
    
    const response = await fetch(verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${encodeURIComponent(TURNSTILE_SECRET_KEY)}&response=${encodeURIComponent(token)}`
    });

    const data = await response.json();

    if (data.success) {
      return res.status(200).json({ success: true });
    } else {
      console.warn('[api/verify] Turnstile verification failed:', data);
      return res.status(403).json({ success: false, error: 'Verification failed' });
    }
  } catch (error) {
    console.error('[api/verify] Fatal error:', error);
    return res.status(500).json({ error: 'Internal security verification error' });
  }
}
