const axios = require('axios');

module.exports = async function handler(req, res) {
    const allowed = ['http://localhost:5173', 'https://vivekcyr25.github.io'];
    const origin = req.headers.origin || '';
    res.setHeader('Access-Control-Allow-Origin', allowed.includes(origin) ? origin : 'https://vivekcyr25.github.io');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { token } = req.body;
    const SECRET = process.env.TURNSTILE_SECRET_KEY || '0x4AAAAAADK9mY-Qbx-bzw3USU47ARkiBvQ';

    try {
        const verifyRes = await axios.post('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            secret: SECRET,
            response: token
        });

        if (verifyRes.data.success) {
            return res.status(200).json({ success: true, message: 'Identity verified' });
        } else {
            return res.status(403).json({ success: false, message: 'Identity verification failed' });
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Verification gateway error' });
    }
};
