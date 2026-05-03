const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const crypto = require("crypto");

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();
const auth = admin.auth();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// ============ CONFIG ============
const CONFIG = {
    ENCRYPTION_SECRET: 'your-32-byte-hex-encryption-secret-change-this-in-production',
    SALT: 'apis-salt-v1',
    ITERATIONS: 100000,
};

// ============ CRYPTO UTILS ============
const deriveKey = (userId = '') => {
    const baseSecret = CONFIG.ENCRYPTION_SECRET + userId;
    return crypto.pbkdf2Sync(baseSecret, CONFIG.SALT, CONFIG.ITERATIONS, 32, 'sha256');
};

const decryptData = (payload, userId = '') => {
    try {
        const key = deriveKey(userId);
        const iv = Buffer.from(payload.iv, 'hex');
        const ciphertext = Buffer.from(payload.encryptedData, 'hex');
        const authTag = Buffer.from(payload.authTag, 'hex');

        const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
        decipher.setAuthTag(authTag);
        
        let decrypted = decipher.update(ciphertext, 'binary', 'utf8');
        decrypted += decipher.final('utf8');
        return JSON.parse(decrypted);
    } catch (err) {
        console.error("Decryption failed:", err);
        return null;
    }
};

// ============ MIDDLEWARE ============
const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const idToken = authHeader.split('Bearer ')[1];
    try {
        const decodedToken = await auth.verifyIdToken(idToken);
        req.user = decodedToken;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// ============ AUTH ENDPOINTS ============
app.post('/auth/register', async (req, res) => {
    const { name, regNo, password } = req.body;
    try {
        // In a real app, we'd use Firebase Auth. For simplicity with the existing UI:
        const userRecord = await auth.createUser({
            email: `${regNo}@apis.com`,
            password: password,
            displayName: name,
        });

        await db.collection('users').doc(userRecord.uid).set({
            name,
            regNo,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        res.status(201).json({ 
            message: 'User registered', 
            data: { user: { id: userRecord.uid, name, regNo } } 
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.post('/auth/login', async (req, res) => {
    const { regNo, password } = req.body;
    try {
        // Find user in Firestore by regNo
        const userSnapshot = await db.collection('users').where('regNo', '==', regNo).limit(1).get();
        if (userSnapshot.empty) {
            return res.status(401).json({ message: 'User not found' });
        }
        const userData = userSnapshot.docs[0].data();
        const userId = userSnapshot.docs[0].id;

        // In a real Firebase app, we'd sign in on the client.
        // For this "direct connection" implementation, we'll return a custom token or mock session.
        const customToken = await auth.createCustomToken(userId);

        res.json({ 
            message: 'Login successful', 
            data: { 
                accessToken: customToken, // This is a Firebase custom token
                user: { id: userId, name: userData.name, regNo: userData.regNo } 
            } 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ============ DASHBOARD ============
app.get('/dashboard', authenticate, async (req, res) => {
    try {
        const marksSnapshot = await db.collection('marks')
            .where('userId', '==', req.user.uid)
            .get();
        
        const marks = marksSnapshot.docs.map(doc => doc.data());
        
        // Calculate stats
        const totalSubjects = marks.length;
        const passCount = marks.filter(m => m.grade !== 'F').length;
        const failCount = totalSubjects - passCount;
        const totalMarks = marks.reduce((acc, m) => acc + (m.total || 0), 0);
        const overallAverage = totalSubjects > 0 ? (totalMarks / totalSubjects).toFixed(2) : 0;
        
        // Simple GPA (mock)
        const gpa = totalSubjects > 0 ? (totalMarks / 10 / totalSubjects).toFixed(2) : '0.00';

        const bestSubject = marks.length > 0 ? marks.reduce((prev, current) => (prev.total > current.total) ? prev : current) : null;
        const weakSubject = marks.length > 0 ? marks.reduce((prev, current) => (prev.total < current.total) ? prev : current) : null;

        res.json({
            data: {
                totalSubjects,
                passCount,
                failCount,
                overallAverage,
                gpa,
                bestSubject,
                weakSubject
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ============ MARKS CRUD ============
app.get('/marks', authenticate, async (req, res) => {
    try {
        const snapshot = await db.collection('marks')
            .where('userId', '==', req.user.uid)
            .get();
        const data = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
        res.json({ data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/marks', authenticate, async (req, res) => {
    const { subject, ca1, ca2, mte, ete } = req.body;
    const total = ca1 + ca2 + mte + ete;
    
    // Simple grade calculation
    let grade = 'F';
    if (total >= 90) grade = 'O';
    else if (total >= 80) grade = 'A+';
    else if (total >= 70) grade = 'A';
    else if (total >= 60) grade = 'B';
    else if (total >= 50) grade = 'C';

    const newMark = {
        userId: req.user.uid,
        subject, ca1, ca2, mte, ete, total, grade,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    try {
        const docRef = await db.collection('marks').add(newMark);
        res.status(201).json({ message: 'Mark added', data: { _id: docRef.id, ...newMark } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put('/marks/:id', authenticate, async (req, res) => {
    const { subject, ca1, ca2, mte, ete } = req.body;
    const total = ca1 + ca2 + mte + ete;
    
    let grade = 'F';
    if (total >= 90) grade = 'O';
    else if (total >= 80) grade = 'A+';
    else if (total >= 70) grade = 'A';
    else if (total >= 60) grade = 'B';
    else if (total >= 50) grade = 'C';

    try {
        await db.collection('marks').doc(req.params.id).update({
            subject, ca1, ca2, mte, ete, total, grade
        });
        res.json({ message: 'Mark updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.delete('/marks/:id', authenticate, async (req, res) => {
    try {
        await db.collection('marks').doc(req.params.id).delete();
        res.json({ message: 'Mark deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ============ ANALYTICS ============
app.get('/analytics', authenticate, async (req, res) => {
    try {
        const marksSnapshot = await db.collection('marks')
            .where('userId', '==', req.user.uid)
            .get();
        const marks = marksSnapshot.docs.map(doc => doc.data());

        const subjectPerformance = marks.map(m => ({ subject: m.subject, total: m.total, grade: m.grade }));
        
        const gradeDistribution = marks.reduce((acc, m) => {
            acc[m.grade] = (acc[m.grade] || 0) + 1;
            return acc;
        }, {});

        const componentBreakdown = {
            avgCA1: marks.length > 0 ? (marks.reduce((a, b) => a + b.ca1, 0) / marks.length).toFixed(1) : 0,
            avgCA2: marks.length > 0 ? (marks.reduce((a, b) => a + b.ca2, 0) / marks.length).toFixed(1) : 0,
            avgMTE: marks.length > 0 ? (marks.reduce((a, b) => a + b.mte, 0) / marks.length).toFixed(1) : 0,
            avgETE: marks.length > 0 ? (marks.reduce((a, b) => a + b.ete, 0) / marks.length).toFixed(1) : 0,
        };

        res.json({
            data: {
                subjectPerformance,
                gradeDistribution,
                componentBreakdown
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Expose API as a single Cloud Function
exports.api = onRequest(app);
