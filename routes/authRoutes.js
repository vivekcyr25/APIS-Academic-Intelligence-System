const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Student = require('../models/Student');
const { generateSimulatedData } = require('../umsService');
const { studentsDb } = require('../database');
const router = express.Router();

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required." });
    }

    try {
        // Step 1: Find user
        let student = await Student.findOne({ regNo: username });
        
        if (!student) {
            // NEW USER LOGIC: Create student on the fly if not exists
            const hashedPassword = await bcrypt.hash(password, 10);
            
            // Generate baseline data so dashboard isn't empty
            const baseline = generateSimulatedData(username);
            
            // Try to find real name from studentsDb if it exists
            const dbMatch = studentsDb.find(s => s.regNo === username);
            const finalName = dbMatch ? dbMatch.name : baseline.name;

            student = new Student({
                regNo: username,
                password: hashedPassword,
                name: finalName,
                semester: dbMatch ? dbMatch.semester : '1',
                attendance: baseline.attendance,
                subjectAttendance: baseline.subjectAttendance,
                marks: baseline.marks,
                timetable: baseline.timetable,
                academicHistory: baseline.academicHistory,
                syllabus: baseline.syllabus,
                // Assign role 'admin' only to specific ID
                role: username === '12510200' ? 'admin' : 'student'
            });
            await student.save();
        } else {
            // Existing user check
            let isMatch = await bcrypt.compare(password, student.password);
            
            // Hardcoded safety for Admin during transition
            if (!isMatch && username === '12510200' && (password === 'Vivek50' || password === '@Vivek50')) {
                isMatch = true;
            }

            if (!isMatch) {
                return res.status(401).json({ error: "Invalid credentials! Access denied." });
            }

            // FAIL-SAFE: If existing student has no marks, generate them now
            const marksExist = student.marks && (student.marks instanceof Map ? student.marks.size > 0 : Object.keys(student.marks).length > 0);
            
            if (!marksExist) {
                console.log(`[FAIL-SAFE] Generating missing marks for ${username}`);
                const baseline = generateSimulatedData(username);
                student.marks = baseline.marks;
                student.attendance = student.attendance || baseline.attendance;
                student.subjectAttendance = student.subjectAttendance || baseline.subjectAttendance;
                student.timetable = (student.timetable && student.timetable.length > 0) ? student.timetable : baseline.timetable;
                await student.save();
            }
        }

        // Explicit Role Check (Override for Admin ID 12510200)
        const userRole = (student.regNo === '12510200') ? 'admin' : student.role;

        const token = jwt.sign(
            { regNo: student.regNo, role: userRole }, 
            process.env.JWT_SECRET || 'lpu_super_secret_key', 
            { expiresIn: '1d' }
        );
        
        const studentData = student.toObject();
        delete studentData.password;
        studentData.role = userRole; // Ensure correct role in response

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
        const student = await Student.findOne({ regNo: req.user.regNo }).select('-password');
        if (!student) return res.status(404).json({ error: 'User not found.' });

        // Ensure role is correctly reported for Admin
        const studentObj = student.toObject();
        if (student.regNo === '12510200') studentObj.role = 'admin';

        res.json(studentObj);
    } catch (e) {
        res.status(500).json({ error: 'Server error.' });
    }
});

module.exports = router;
