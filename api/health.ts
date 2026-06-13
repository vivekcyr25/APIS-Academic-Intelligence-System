import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (_req.method === 'OPTIONS') return res.status(200).end();
  if (_req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  return res.status(200).json({
    status: 'ok',
    provider: 'groq',
    model: 'llama-3.3-70b-versatile',
    online: !!process.env.GROQ_API_KEY,
  });
}
