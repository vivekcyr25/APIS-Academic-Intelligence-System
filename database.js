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
    // New Students from Images
    { regNo: "12510845", name: "Aditya Dubey", password: "12510845", role: "student", semester: "Semester 4", attendance: "85%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },
    { regNo: "12506054", name: "Rahul Kumar", password: "12506054", role: "student", semester: "Semester 4", attendance: "82%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },
    { regNo: "12523549", name: "Lakshya", password: "12523549", role: "student", semester: "Semester 4", attendance: "88%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },
    { regNo: "12502442", name: "Arpita Kumari", password: "12502442", role: "student", semester: "Semester 4", attendance: "79%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },
    { regNo: "12510501", name: "Abhiroop Shanker Tewari", password: "12510501", role: "student", semester: "Semester 4", attendance: "91%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },
    { regNo: "12513602", name: "C Niharika", password: "12513602", role: "student", semester: "Semester 4", attendance: "84%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },
    { regNo: "12501371", name: "Abhi Masand", password: "12501371", role: "student", semester: "Semester 4", attendance: "87%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },
    { regNo: "12511269", name: "Anukula Chiranjeevi Sri Rudra D Eva R", password: "12511269", role: "student", semester: "Semester 4", attendance: "93%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },
    { regNo: "12512154", name: "Jeevan Kumar Javapu", password: "12512154", role: "student", semester: "Semester 4", attendance: "80%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },
    { regNo: "12509379", name: "Bidita Gogoi", password: "12509379", role: "student", semester: "Semester 4", attendance: "86%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },
    { regNo: "12501596", name: "Sai Reddy Bommareddy", password: "12501596", role: "student", semester: "Semester 4", attendance: "89%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },
    { regNo: "12513344", name: "Pagadapula Abhilash", password: "12513344", role: "student", semester: "Semester 4", attendance: "77%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },
    { regNo: "12501924", name: "Taranjit Singh", password: "12501924", role: "student", semester: "Semester 4", attendance: "95%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },
    { regNo: "12513788", name: "Samiksha", password: "12513788", role: "student", semester: "Semester 4", attendance: "83%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },
    { regNo: "12505111", name: "Avani Sharma", password: "12505111", role: "student", semester: "Semester 4", attendance: "88%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },
    { regNo: "12512544", name: "Arpit Dhiman", password: "12512544", role: "student", semester: "Semester 4", attendance: "91%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },
    { regNo: "12511835", name: "Vansh Dadwal", password: "12511835", role: "student", semester: "Semester 4", attendance: "82%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },
    { regNo: "12511322", name: "Narupalli Siva Jyothi", password: "12511322", role: "student", semester: "Semester 4", attendance: "84%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },
    { regNo: "12504581", name: "Salil Manan", password: "12504581", role: "student", semester: "Semester 4", attendance: "79%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },
    { regNo: "12510169", name: "Ram Charan", password: "12510169", role: "student", semester: "Semester 4", attendance: "92%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },
    { regNo: "12508053", name: "Saksham Kumar", password: "12508053", role: "student", semester: "Semester 4", attendance: "85%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },
    { regNo: "12500841", name: "Anubhaw Garg", password: "12500841", role: "student", semester: "Semester 4", attendance: "87%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },
    { regNo: "12509115", name: "Naveen Kumar", password: "12509115", role: "student", semester: "Semester 4", attendance: "90%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },
    
    { regNo: "12510299", name: "Shubham Gupta", password: "12510299", role: "student", semester: "Semester 4", attendance: "88%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },
    { regNo: "12511911", name: "Ujjawal Saini", password: "12511911", role: "student", semester: "Semester 4", attendance: "81%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },
    { regNo: "12512423", name: "Shivam Kumar", password: "12512423", role: "student", semester: "Semester 4", attendance: "84%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },
    { regNo: "12510287", name: "Ajay Kumar Uppula", password: "12510287", role: "student", semester: "Semester 4", attendance: "76%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },
    { regNo: "12523665", name: "Sheersh Mishra", password: "12523665", role: "student", semester: "Semester 4", attendance: "93%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },
    { regNo: "12505516", name: "Rihan Rafeeque", password: "12505516", role: "student", semester: "Semester 4", attendance: "85%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },
    { regNo: "12510182", name: "Chitturi Tarun Sanjay", password: "12510182", role: "student", semester: "Semester 4", attendance: "89%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },
    { regNo: "12523382", name: "Jaskaran Singh", password: "12523382", role: "student", semester: "Semester 4", attendance: "82%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },
    { regNo: "12505911", name: "Geetla Ruthika Reddy", password: "12505911", role: "student", semester: "Semester 4", attendance: "91%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },
    { regNo: "12505182", name: "Kottam Diwakar", password: "12505182", role: "student", semester: "Semester 4", attendance: "80%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },
    { regNo: "12512849", name: "Chidvilas Gandhi Vipparthi", password: "12512849", role: "student", semester: "Semester 4", attendance: "87%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },
    { regNo: "12510787", name: "Joyal Joshy", password: "12510787", role: "student", semester: "Semester 4", attendance: "84%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },
    { regNo: "22516267", name: "Ujjawal Kumar", password: "22516267", role: "student", semester: "Semester 4", attendance: "86%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },
    { regNo: "12311324", name: "Suhani Guha Neogi", password: "12311324", role: "student", semester: "Semester 4", attendance: "90%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },
    { regNo: "12316903", name: "Bhavya Jain", password: "12316903", role: "student", semester: "Semester 4", attendance: "83%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },
    { regNo: "12407778", name: "Manthan Mandavade", password: "12407778", role: "student", semester: "Semester 4", attendance: "88%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },
    { regNo: "12411147", name: "Amit Maurya", password: "12411147", role: "student", semester: "Semester 4", attendance: "85%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },
    { regNo: "12411477", name: "Abhishek Nair", password: "12411477", role: "student", semester: "Semester 4", attendance: "92%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },
    { regNo: "12413071", name: "Shivam Kundu", password: "12413071", role: "student", semester: "Semester 4", attendance: "79%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },
    { regNo: "12500082", name: "Adhil K", password: "12500082", role: "student", semester: "Semester 4", attendance: "81%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },
    { regNo: "12501129", name: "Kanala Karthik", password: "12501129", role: "student", semester: "Semester 4", attendance: "87%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },
    { regNo: "12500401", name: "Pradeep Verma", password: "12500401", role: "student", semester: "Semester 4", attendance: "84%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },
    { regNo: "12500598", name: "Vinay Chauhan", password: "12500598", role: "student", semester: "Semester 4", attendance: "90%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },
    { regNo: "12500811", name: "Vijay L", password: "12500811", role: "student", semester: "Semester 4", attendance: "82%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },
    { regNo: "12500819", name: "Piyush Ranjan", password: "12500819", role: "student", semester: "Semester 4", attendance: "85%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },

    { regNo: "12510202", name: "Rahul Sharma",   password: "12510202", role: "student", semester: "Semester 4", attendance: "92%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },
    { regNo: "12510203", name: "Neha Gupta",     password: "12510203", role: "student", semester: "Semester 4", attendance: "78%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },
    { regNo: "12510204", name: "Aditi Singh",    password: "12510204", role: "student", semester: "Semester 4", attendance: "88%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },
    { regNo: "12510205", name: "Karan Patel",    password: "12510205", role: "student", semester: "Semester 4", attendance: "95%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },
    { regNo: "12510206", name: "Priya Desai",    password: "12510206", role: "student", semester: "Semester 4", attendance: "81%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },
    { regNo: "12510207", name: "Amit Kumar",     password: "12510207", role: "student", semester: "Semester 4", attendance: "76%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] },
    { regNo: "12510208", name: "Sneha Reddy",    password: "12510208", role: "student", semester: "Semester 4", attendance: "89%", marks: generateRandomMarks(), timetable: [], academicHistory: {}, syllabus: [] }
];

module.exports = { studentsDb, subjectsList };
