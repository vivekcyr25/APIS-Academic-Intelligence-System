const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    adminId: { type: String, required: true },
    action: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    details: { type: Object, default: {} }
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
