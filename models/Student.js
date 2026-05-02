const mongoose = require('mongoose');

const subjectMarksSchema = new mongoose.Schema({
    ca1: { type: Number, default: 0, min: 0, max: 15 },
    ca2: { type: Number, default: 0, min: 0, max: 15 },
    mte: { type: Number, default: 0, min: 0, max: 20 },
    ete: { type: Number, default: 0, min: 0, max: 50 }
}, { _id: false });

const studentSchema = new mongoose.Schema({
    regNo: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true }, // Will be hashed by bcrypt
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    semester: { type: String, default: "Semester 4" },
    attendance: { type: String, default: "0%" },
    marks: {
        type: Map,
        of: subjectMarksSchema
    }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
