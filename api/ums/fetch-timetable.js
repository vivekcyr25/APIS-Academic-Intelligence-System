export default async function handler(req, res) {
    const allowed = ['http://localhost:5173', 'https://vivekcyr25.github.io'];
    const origin = req.headers.origin || '';
    res.setHeader('Access-Control-Allow-Origin', allowed.includes(origin) ? origin : 'https://vivekcyr25.github.io');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const timetable = [
        { day: 'Monday', time: '09:00 AM', subject: 'CSE310', room: 'B-201', type: 'Lecture' },
        { day: 'Monday', time: '11:00 AM', subject: 'MTH401', room: 'C-302', type: 'Tutorial' },
        { day: 'Tuesday', time: '10:00 AM', subject: 'CSE316', room: 'Lab-1', type: 'Practical' },
        { day: 'Wednesday', time: '02:00 PM', subject: 'INT202', room: 'B-105', type: 'Lecture' }
    ];

    return res.status(200).json({ success: true, data: timetable });
};
