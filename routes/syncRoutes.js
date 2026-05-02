const express = require('express');
const Student = require('../models/Student');
const { protect } = require('../middleware/authMiddleware');
const { syncUMS } = require('../umsService');
const router = express.Router();

/**
 * POST /api/student/sync
 * Body: { regNo, password }
 * Calls UMS scraper, saves data to DB — password is NEVER stored.
 */
router.post('/sync', protect, async (req, res) => {
    const { regNo, password } = req.body;

    if (!regNo || !password) {
        return res.status(400).json({ error: 'regNo and UMS password are required.' });
    }

    // A student can only sync their own data; admin can sync any
    if (req.user.role !== 'admin' && req.user.regNo !== regNo) {
        return res.status(403).json({ error: 'Unauthorized: you can only sync your own data.' });
    }

    try {
        console.log(`[SYNC] Starting UMS sync for ${regNo}...`);

        // 🔑 password used ONLY for scraping — never saved
        const scrapedData = await syncUMS(regNo, password);

        // Update student document — selective merge
        const update = {
            umsSynced:    true,
            lastSyncDate: new Date()
        };

        if (scrapedData.timetable && scrapedData.timetable.length > 0) {
            update.timetable = scrapedData.timetable;
        }
        if (scrapedData.attendance) {
            update.attendance = scrapedData.attendance;
        }
        if (scrapedData.academicHistory && Object.keys(scrapedData.academicHistory).length > 0) {
            update.academicHistory = scrapedData.academicHistory;
        }
        if (scrapedData.syllabus && scrapedData.syllabus.length > 0) {
            update.syllabus = scrapedData.syllabus;
        }

        const student = await Student.findOneAndUpdate(
            { regNo },
            { $set: update },
            { new: true }
        ).select('-password');

        if (!student) {
            return res.status(404).json({ error: 'Student not found in database.' });
        }

        console.log(`[SYNC] ✅ Sync complete for ${regNo}.`);
        res.json({
            message: 'UMS sync successful!',
            lastSyncDate: student.lastSyncDate,
            itemsSynced: {
                timetableEntries:    (student.timetable || []).length,
                semestersInHistory:  Object.keys(scrapedData.academicHistory || {}).length,
                attendanceUpdated:   !!scrapedData.attendance
            }
        });

    } catch (err) {
        console.error(`[SYNC] ❌ Sync failed for ${regNo}:`, err.message);
        res.status(500).json({
            error: 'UMS sync failed.',
            detail: err.message
        });
    }
});

module.exports = router;
