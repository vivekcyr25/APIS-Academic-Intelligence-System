export default async function handler(req, res) {
    const allowed = ['http://localhost:5173', 'https://vivekcyr25.github.io'];
    const origin = req.headers.origin || '';
    res.setHeader('Access-Control-Allow-Origin', allowed.includes(origin) ? origin : 'https://vivekcyr25.github.io');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const assignments = [
        { title: 'Project Prototype', subject: 'CSE310', dueDate: '2024-05-15', status: 'pending', priority: 'high' },
        { title: 'System Analysis', subject: 'CSE316', dueDate: '2024-05-12', status: 'submitted', priority: 'medium' },
        { title: 'Calculus Quiz', subject: 'MTH401', dueDate: '2024-05-20', status: 'pending', priority: 'medium' },
        { title: 'Design Patterns Lab', subject: 'INT202', dueDate: '2024-05-18', status: 'pending', priority: 'low' }
    ];

    return res.status(200).json({ success: true, data: assignments });
};
