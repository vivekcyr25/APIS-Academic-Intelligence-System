const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Mock database of students
const students = [
    { regNo: "12510200", name: "Vivek", maths: 85, physics: 78, comp: 92 },
    { regNo: "12510201", name: "Harsh", maths: 75, physics: 68, comp: 80 },
    { regNo: "12510202", name: "Rahul", maths: 90, physics: 88, comp: 85 },
    { regNo: "12510203", name: "Neha", maths: 65, physics: 70, comp: 72 }
];

// API endpoint to fetch student marks
app.post('/api/marks', (req, res) => {
    const { regNo, name } = req.body;
    
    if (!regNo || !name) {
        return res.status(400).json({ error: "Registration number and name are required." });
    }

    // Admin view: show all
    if (regNo === "12510200" && name.toLowerCase() === "admin") {
        return res.json({ isAdmin: true, data: students });
    }

    const student = students.find(s => s.regNo === regNo);
    
    if (student) {
        return res.json({ isAdmin: false, data: [student] });
    } else {
        return res.status(404).json({ error: "No record found." });
    }
});

// Fallback to index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
