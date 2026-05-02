const express = require('express');
const ActivityLog = require('../models/ActivityLog');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const router = express.Router();

// GET all activity logs (Admin only)
router.get('/', protect, adminOnly, async (req, res) => {
    try {
        const logs = await ActivityLog.find().sort({ timestamp: -1 }).limit(50);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: "Server error fetching activity logs." });
    }
});

// POST a new activity log (Admin only)
router.post('/', protect, adminOnly, async (req, res) => {
    const { action, details } = req.body;
    try {
        const newLog = await ActivityLog.create({
            adminId: req.user.regNo,
            action,
            details
        });
        res.status(201).json(newLog);
    } catch (error) {
        res.status(500).json({ error: "Server error creating activity log." });
    }
});

module.exports = router;
