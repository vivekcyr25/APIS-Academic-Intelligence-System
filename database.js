const subjectsList = ["Mathematics", "Physics", "Computer Science", "English", "DBMS", "C Programming"];

function generateRandomMarks() {
    const marks = {};
    subjectsList.forEach(sub => {
        marks[sub] = {
            ca1: Math.floor(Math.random() * 8) + 7, // 7-15
            ca2: Math.floor(Math.random() * 8) + 7, // 7-15
            mte: Math.floor(Math.random() * 10) + 10, // 10-20
            ete: Math.floor(Math.random() * 25) + 25  // 25-50
        };
    });
    return marks;
}

// In-memory mock database
const studentsDb = [
    { regNo: "12510201", name: "Harsh Vardhan", password: "12510201", role: "student", semester: "Semester 4", attendance: "85%", marks: generateRandomMarks() },
    { regNo: "12510202", name: "Rahul Sharma", password: "12510202", role: "student", semester: "Semester 4", attendance: "92%", marks: generateRandomMarks() },
    { regNo: "12510203", name: "Neha Gupta", password: "12510203", role: "student", semester: "Semester 4", attendance: "78%", marks: generateRandomMarks() },
    { regNo: "12510204", name: "Aditi Singh", password: "12510204", role: "student", semester: "Semester 4", attendance: "88%", marks: generateRandomMarks() },
    { regNo: "12510205", name: "Karan Patel", password: "12510205", role: "student", semester: "Semester 4", attendance: "95%", marks: generateRandomMarks() },
    { regNo: "12510206", name: "Priya Desai", password: "12510206", role: "student", semester: "Semester 4", attendance: "81%", marks: generateRandomMarks() },
    { regNo: "12510207", name: "Amit Kumar", password: "12510207", role: "student", semester: "Semester 4", attendance: "76%", marks: generateRandomMarks() },
    { regNo: "12510208", name: "Sneha Reddy", password: "12510208", role: "student", semester: "Semester 4", attendance: "89%", marks: generateRandomMarks() }
];

module.exports = {
    studentsDb,
    subjectsList
};
