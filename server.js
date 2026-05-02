const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcryptjs');

dotenv.config();

const authRoutes     = require('./routes/authRoutes');
const studentRoutes  = require('./routes/studentRoutes');
const activityRoutes = require('./routes/activityRoutes');
const aiRoutes       = require('./routes/aiRoutes');
const chatRoutes     = require('./routes/chatRoutes');
const syncRoutes     = require('./routes/syncRoutes');
const whatsappRoutes = require('./routes/whatsappRoutes');
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
app.use('/api', authRoutes);                  // login
app.use('/api/student', studentRoutes);        // fetch and update marks
app.use('/api/student', syncRoutes);           // UMS sync (POST /api/student/sync)
app.use('/api/activity', activityRoutes);      // admin activity logs
app.use('/api/ai-analysis', aiRoutes);         // gemini ai analysis
app.use('/api/chat', chatRoutes);              // chatbot intent-switch
app.use('/api/whatsapp', whatsappRoutes);      // Twilio WhatsApp webhook

// Fallback route for SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ==========================================
// TASK 7: MONGODB ATLAS SETUP (PERMANENT DATA)
// ==========================================
// For data to persist across Render server restarts, set MONGO_URI in your environment.
//
// Step 1: Go to https://cloud.mongodb.com and create a FREE cluster.
// Step 2: Create a database user with a password.
// Step 3: Click "Connect" → "Drivers" → copy the connection string.
//         It looks like: mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/lpu_portal
// Step 4: In Render dashboard → Your Service → "Environment" tab → Add:
//         Key:   MONGO_URI
//         Value: (your connection string from Step 3)
// Step 5: Redeploy. Data will now persist permanently in Atlas!
//
// For local development, create a .env file in this directory with:
//   MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/lpu_portal
//   GEMINI_API_KEY=your_gemini_api_key_here
//   JWT_SECRET=your_jwt_secret_here
// ==========================================

async function startServer() {
    try {
        let mongoUri = process.env.MONGO_URI;

        // MONGO_URI from environment is always prioritized (Atlas / persistent DB).
        // Falls back to in-memory MongoDB only when no URI is provided (local dev / Render cold start).
        if (!mongoUri) {
            console.log('⚠️  No MONGO_URI set. Using temporary in-memory MongoDB (data lost on restart).');
            console.log('   See server.js Task 7 comments to configure MongoDB Atlas for permanent storage.');
            const mongoServer = await MongoMemoryServer.create();
            mongoUri = mongoServer.getUri();
        } else {
            console.log('✅ Using persistent MongoDB Atlas connection.');
        }

        await mongoose.connect(mongoUri);
        console.log('✅ MongoDB Connected successfully!');

        // Auto-seed and Force Sync Students from database.js
        console.log('🔄 Synchronizing student database with master list...');
        for (let student of studentsDb) {
            let doc = await Student.findOne({ regNo: student.regNo });
            if (!doc) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(student.password, salt);
                await Student.create({ ...student, password: hashedPassword });
                console.log(`[SEED] Created: ${student.name} (${student.regNo})`);
            } else {
                // FORCE UPDATE to match database.js master list
                doc.name = student.name;
                doc.marks = student.marks;
                doc.attendance = student.attendance;
                doc.semester = student.semester;
                await doc.save();
            }
        }
        console.log('✅ Student database fully synchronized!');

        // ALWAYS ensure Admin exists and has correct credentials
        const salt = await bcrypt.genSalt(10);
        const hashedAdminPassword = await bcrypt.hash('Vivek50', salt);
        
        await Student.findOneAndUpdate(
            { regNo: '12510200' },
            { 
                $set: {
                    name: 'Vivek (Admin)',
                    password: hashedAdminPassword,
                    role: 'admin',
                    semester: 'N/A'
                }
            },
            { upsert: true, new: true }
        );
        console.log('✅ Admin account (12510200) verified and credentials reset!');

        app.listen(PORT, () => {
            console.log(`🚀 Server is running on http://localhost:${PORT}`);
        });

    } catch (err) {
        console.error('❌ Failed to start server:', err);
    }
}

startServer();
