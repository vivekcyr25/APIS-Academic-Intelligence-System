const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcryptjs');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const Student = require('./models/Student');
const { studentsDb } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Serve static files from the current directory (where index.html is)
app.use(express.static(__dirname));

// ==========================================
// API ROUTES
// ==========================================
app.use('/api', authRoutes); // login
app.use('/api/student', studentRoutes); // fetch and update marks

// Fallback route for SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Auto-start DB and Server
async function startServer() {
    try {
        let mongoUri = process.env.MONGO_URI;

        // If no MongoDB URI is provided, use an in-memory Mongo server automatically
        if (!mongoUri) {
            console.log('No MONGO_URI found, starting local in-memory MongoDB...');
            const mongoServer = await MongoMemoryServer.create();
            mongoUri = mongoServer.getUri();
        }

        await mongoose.connect(mongoUri);
        console.log('✅ MongoDB Connected successfully!');

        // Auto-seed if empty
        const count = await Student.countDocuments();
        if (count === 0) {
            console.log('Database is empty. Seeding with default student records...');
            for (let student of studentsDb) {
                const salt = await bcrypt.genSalt(10);
                student.password = await bcrypt.hash(student.password, salt);
                await Student.create(student);
            }
            console.log('✅ Database seeded with authentic hashed passwords!');
        }

        app.listen(PORT, () => {
            console.log(`🚀 Server is running on http://localhost:${PORT}`);
        });

    } catch (err) {
        console.error('❌ Failed to start server:', err);
    }
}

startServer();
