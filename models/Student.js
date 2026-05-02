const mongoose = require('mongoose');

const subjectMarksSchema = new mongoose.Schema({
    ca1: { type: Number, default: 0, min: 0, max: 15 },
    ca2: { type: Number, default: 0, min: 0, max: 15 },
    mte: { type: Number, default: 0, min: 0, max: 20 },
    ete: { type: Number, default: 0, min: 0, max: 50 }
}, { _id: false });

// ── Academic History ──────────────────────────────────────────────────────────
const historySubjectSchema = new mongoose.Schema({
    name:  { type: String },
    grade: { type: String },
    marks: { type: Number }
}, { _id: false });

const semesterHistorySchema = new mongoose.Schema({
    subjects: [historySubjectSchema],
    cgpa:     { type: Number, default: 0 }
}, { _id: false });

// ── Timetable ──────────────────────────────────────────────────────────────────
const timetableEntrySchema = new mongoose.Schema({
    subject: { type: String },
    time:    { type: String },
    room:    { type: String },
    day:     { type: String, enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'] }
}, { _id: false });

// ── Syllabus ───────────────────────────────────────────────────────────────────
const syllabusEntrySchema = new mongoose.Schema({
    subjectName: { type: String },
    topics:      { type: String }
}, { _id: false });

// ── Main Student Schema ────────────────────────────────────────────────────────
const studentSchema = new mongoose.Schema({
    regNo:       { type: String, required: true, unique: true },
    name:        { type: String, required: true },
    password:    { type: String, required: true },
    role:        { type: String, enum: ['student', 'admin'], default: 'student' },
    semester:    { type: String, default: 'Semester 4' },
    attendance:  { type: String, default: '0%' },
    subjectAttendance: { type: Map, of: Number, default: {} },
    phoneNumber: { type: String, default: '' },       // for WhatsApp identification
    umsSynced:   { type: Boolean, default: false },
    lastSyncDate:{ type: Date },
    marks: {
        type: Map,
        of: subjectMarksSchema
    },
    timetable:       { type: [timetableEntrySchema], default: [] },
    academicHistory: {
        type: Map,
        of: semesterHistorySchema,
        default: {}
    },
    syllabus:    { type: [syllabusEntrySchema], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
