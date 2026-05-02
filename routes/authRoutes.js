const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Student = require('../models/Student');
const { generateSimulatedData } = require('../umsService');
const router = express.Router();

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required." });
    }

    try {
        // Admin check
        if (username === "12510200" && password === "@Vivek50") {
            const token = jwt.sign(
                { regNo: username, role: 'admin' }, 
                process.env.JWT_SECRET || 'lpu_super_secret_key', 
                { expiresIn: '1d' }
            );
            return res.json({ token, user: { role: 'admin', regNo: username, name: 'Administrator' } });
        }

        // Student DB Check
        let student = await Student.findOne({ regNo: username });
        
        if (!student) {
            // NEW USER LOGIC: Create student on the fly if not exists
            const hashedPassword = await bcrypt.hash(password, 10);
            
            // Generate baseline data so dashboard isn't empty
            const baseline = generateSimulatedData(username);

            student = new Student({
                regNo: username,
                password: hashedPassword,
                name: baseline.name,
                semester: '1',
                attendance: baseline.attendance,
                subjectAttendance: baseline.subjectAttendance,
                marks: baseline.marks,
                timetable: baseline.timetable,
                academicHistory: baseline.academicHistory,
                syllabus: baseline.syllabus
            });
            await student.save();
        } else {
            // Existing user check
            const isMatch = await bcrypt.compare(password, student.password);
            if (!isMatch) {
                return res.status(401).json({ error: "Invalid credentials! Access denied." });
            }
        }

        const token = jwt.sign(
            { regNo: student.regNo, role: student.role }, 
            process.env.JWT_SECRET || 'lpu_super_secret_key', 
            { expiresIn: '1d' }
        );
        
        const studentData = student.toObject();
        delete studentData.password;

        res.json({ token, user: studentData });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Server error during login." });
    }
});

const { protect } = require('../middleware/authMiddleware');

// GET /api/student/me — silent token validation for auth guard
router.get('/student/me', protect, async (req, res) => {
    try {
        if (req.user.role === 'admin') {
            return res.json({ role: 'admin', regNo: req.user.regNo, name: 'Administrator' });
        }
        const student = await Student.findOne({ regNo: req.user.regNo }).select('-password');
        if (!student) return res.status(404).json({ error: 'User not found.' });
        res.json(student);
    } catch (e) {
        res.status(500).json({ error: 'Server error.' });
    }
});

// DELETE /api/admin/purge — System Maintenance (Admin Only)
router.delete('/admin/purge', protect, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized.' });

    try {
        // Delete all students except the admin account
        const result = await Student.deleteMany({ regNo: { $ne: '12510200' } });
        console.log(`[ADMIN] System Purge complete. Deleted ${result.deletedCount} records.`);
        res.json({ message: `System reset successful. Deleted ${result.deletedCount} student records.` });
    } catch (e) {
        res.status(500).json({ error: 'Purge failed.' });
    }
});

module.exports = router;
