module.exports = async function handler(req, res) {
    const allowed = ['http://localhost:5173', 'https://vivekcyr25.github.io'];
    const origin = req.headers.origin || '';
    res.setHeader('Access-Control-Allow-Origin', allowed.includes(origin) ? origin : 'https://vivekcyr25.github.io');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { regNo, password } = req.body;
    
    const marks = [
        { subject: 'CSE310', score: 92, total: 100, type: 'MTE', weightage: '30%' },
        { subject: 'CSE316', score: 88, total: 100, type: 'MTE', weightage: '30%' },
        { subject: 'MTH401', score: 85, total: 100, type: 'CA1', weightage: '10%' },
        { subject: 'INT202', score: 90, total: 100, type: 'CA1', weightage: '10%' }
    ];

    return res.status(200).json({ success: true, data: marks });
};
