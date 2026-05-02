const subjectsList = ["Mathematics", "Physics", "Computer Science", "English", "DBMS", "C Programming"];

function generateRandomMarks() {
    const marks = {};
    subjectsList.forEach(sub => {
        marks[sub] = {
            ca1: Math.floor(Math.random() * 8) + 7,  // 7-15
            ca2: Math.floor(Math.random() * 8) + 7,  // 7-15
            mte: Math.floor(Math.random() * 10) + 10, // 10-20
            ete: Math.floor(Math.random() * 25) + 25  // 25-50
        };
    });
    return marks;
}

// ── Full timetable for student 12510201 (used for chatbot testing) ─────────────
const mockTimetable = [
    { subject: "Mathematics",      time: "08:00 - 09:00", room: "Block-32, R-301", day: "Monday"    },
    { subject: "Physics",          time: "09:00 - 10:00", room: "Block-32, R-302", day: "Monday"    },
    { subject: "Computer Science", time: "10:00 - 11:00", room: "Block-32, Lab-1", day: "Monday"    },
    { subject: "DBMS",             time: "11:00 - 12:00", room: "Block-34, R-401", day: "Monday"    },

    { subject: "English",          time: "08:00 - 09:00", room: "Block-32, R-201", day: "Tuesday"   },
    { subject: "C Programming",    time: "09:00 - 10:00", room: "Block-32, Lab-2", day: "Tuesday"   },
    { subject: "Mathematics",      time: "11:00 - 12:00", room: "Block-32, R-301", day: "Tuesday"   },
    { subject: "DBMS",             time: "02:00 - 03:00", room: "Block-34, R-401", day: "Tuesday"   },

    { subject: "Physics",          time: "08:00 - 09:00", room: "Block-32, Lab-3", day: "Wednesday" },
    { subject: "Computer Science", time: "10:00 - 11:00", room: "Block-32, Lab-1", day: "Wednesday" },
    { subject: "English",          time: "12:00 - 01:00", room: "Block-32, R-201", day: "Wednesday" },

    { subject: "Mathematics",      time: "08:00 - 09:00", room: "Block-32, R-301", day: "Thursday"  },
    { subject: "C Programming",    time: "09:00 - 10:00", room: "Block-32, Lab-2", day: "Thursday"  },
    { subject: "DBMS",             time: "11:00 - 12:00", room: "Block-34, R-401", day: "Thursday"  },
    { subject: "Physics",          time: "02:00 - 03:00", room: "Block-32, R-302", day: "Thursday"  },

    { subject: "Computer Science", time: "08:00 - 09:00", room: "Block-32, Lab-1", day: "Friday"    },
    { subject: "English",          time: "10:00 - 11:00", room: "Block-32, R-201", day: "Friday"    },
    { subject: "C Programming",    time: "11:00 - 12:00", room: "Block-32, Lab-2", day: "Friday"    },

    { subject: "Mathematics",      time: "08:00 - 10:00", room: "Block-32, R-301", day: "Saturday"  },
    { subject: "DBMS",             time: "10:00 - 11:00", room: "Block-34, R-401", day: "Saturday"  },
];

// ── Academic History (Sem 1 & 2) for student 12510201 ─────────────────────────
const mockAcademicHistory = {
    sem1: {
        subjects: [
            { name: "Engineering Mathematics I",  grade: "A+", marks: 82 },
            { name: "Engineering Physics",         grade: "A",  marks: 76 },
            { name: "Programming in C",            grade: "O",  marks: 91 },
            { name: "English Communication",       grade: "B",  marks: 67 },
            { name: "Engineering Drawing",         grade: "A",  marks: 78 }
        ],
        cgpa: 8.4
    },
    sem2: {
        subjects: [
            { name: "Engineering Mathematics II", grade: "A",  marks: 74 },
            { name: "Data Structures",            grade: "A+", marks: 85 },
            { name: "Digital Electronics",        grade: "B",  marks: 65 },
            { name: "Object Oriented Programming",grade: "O",  marks: 93 },
            { name: "Technical Communication",    grade: "A",  marks: 72 }
        ],
        cgpa: 8.7
    }
};

// ── Syllabus for student 12510201 ─────────────────────────────────────────────
const mockSyllabus = [
    { subjectName: "Mathematics",      topics: "Calculus, Linear Algebra, Differential Equations, Fourier Series, Laplace Transforms" },
    { subjectName: "Physics",          topics: "Wave Optics, Quantum Mechanics, Thermodynamics, Electrostatics, Magnetism" },
    { subjectName: "Computer Science", topics: "Algorithms, Data Structures, Complexity Theory, Graph Theory, Sorting & Searching" },
    { subjectName: "English",          topics: "Technical Writing, Comprehension, Grammar, Presentation Skills, Group Discussion" },
    { subjectName: "DBMS",             topics: "ER Diagrams, SQL, Normalization, Transactions, Indexing, NoSQL Basics" },
    { subjectName: "C Programming",    topics: "Pointers, Arrays, Structures, File I/O, Dynamic Memory, Linked Lists" }
];

// ── Student Seed Data ─────────────────────────────────────────────────────────
const studentsDb = [
    {
        regNo: "12510201",
        name: "Harsh Vardhan",
        password: "12510201",
        role: "student",
        semester: "Semester 4",
        attendance: "85%",
        phoneNumber: "",
        marks: generateRandomMarks(),
        timetable: mockTimetable,
        academicHistory: mockAcademicHistory,
        syllabus: mockSyllabus
    },
    { regNo: "12510202", name: "Rahul Sharma",   password: "12510202", role: "student", semester: "Semester 4", attendance: "92%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },
    { regNo: "12510203", name: "Neha Gupta",     password: "12510203", role: "student", semester: "Semester 4", attendance: "78%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },
    { regNo: "12510204", name: "Aditi Singh",    password: "12510204", role: "student", semester: "Semester 4", attendance: "88%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },
    { regNo: "12510205", name: "Karan Patel",    password: "12510205", role: "student", semester: "Semester 4", attendance: "95%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },
    { regNo: "12510206", name: "Priya Desai",    password: "12510206", role: "student", semester: "Semester 4", attendance: "81%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },
    { regNo: "12510207", name: "Amit Kumar",     password: "12510207", role: "student", semester: "Semester 4", attendance: "76%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },
    { regNo: "12510208", name: "Sneha Reddy",    password: "12510208", role: "student", semester: "Semester 4", attendance: "89%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] }
];

module.exports = { studentsDb, subjectsList };
