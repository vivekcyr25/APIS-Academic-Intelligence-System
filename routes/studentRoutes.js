const express = require('express');
const Student = require('../models/Student');
const ActivityLog = require('../models/ActivityLog');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const router = express.Router();

// GET all students (Admin only)
router.get('/', protect, adminOnly, async (req, res) => {
    try {
        const students = await Student.find().select('-password -__v');
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: "Server error fetching students." });
    }
});

// GET a specific student
router.get('/:regNo', protect, async (req, res) => {
    try {
        // A student can only view their own data unless they are an admin
        if (req.user.role !== 'admin' && req.user.regNo !== req.params.regNo) {
            return res.status(403).json({ error: "You are not authorized to view this record." });
        }

        const student = await Student.findOne({ regNo: req.params.regNo }).select('-password');
        if (!student) {
            return res.status(404).json({ error: "Student record not found." });
        }

        res.json(student);
    } catch (error) {
        res.status(500).json({ error: "Server error fetching student data." });
    }
});

// PUT update student marks (Admin only)
router.put('/:regNo/marks', protect, adminOnly, async (req, res) => {
    const { subject, marks } = req.body;

    if (!subject || !marks) {
        return res.status(400).json({ error: "Subject and marks data are required." });
    }

    try {
        const student = await Student.findOne({ regNo: req.params.regNo });
        if (!student) {
            return res.status(404).json({ error: "Student not found." });
        }

        // Update the specific subject marks using Mongoose Map set
        student.marks.set(subject, marks);
        await student.save();

        // Log the activity
        try {
            await ActivityLog.create({
                adminId: req.user.regNo,
                action: `Updated marks for ${student.name} (${student.regNo}) in ${subject}`,
                details: { studentRegNo: student.regNo, subject, newMarks: marks }
            });
        } catch (logErr) {
            console.error("Failed to log activity:", logErr);
        }

        res.json({ message: "Marks updated successfully!", marks: student.marks.get(subject) });
    } catch (error) {
        res.status(500).json({ error: "Server error updating marks." });
    }
});

module.exports = router;
