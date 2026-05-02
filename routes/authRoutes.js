const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Student = require('../models/Student');
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
        const student = await Student.findOne({ regNo: username });
        if (!student) {
            return res.status(401).json({ error: "Invalid credentials! Access denied." });
        }

        const isMatch = await bcrypt.compare(password, student.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials! Access denied." });
        }

        const token = jwt.sign(
            { regNo: student.regNo, role: student.role }, 
            process.env.JWT_SECRET || 'lpu_super_secret_key', 
            { expiresIn: '1d' }
        );
        
        // Don't send password back to frontend
        const studentData = student.toObject();
        delete studentData.password;

        res.json({ token, user: studentData });
    } catch (error) {
        res.status(500).json({ error: "Server error during login." });
    }
});

module.exports = router;
