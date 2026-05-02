const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Student = require('./models/Student');
const { studentsDb } = require('./database');

mongoose.connect('mongodb://127.0.0.1:27017/lpu_portal')
    .then(async () => {
        console.log('Connected to MongoDB for seeding...');
        await Student.deleteMany({});
        console.log('Cleared existing students.');

        for (let student of studentsDb) {
            // Hash the password before saving to DB
            const salt = await bcrypt.genSalt(10);
            student.password = await bcrypt.hash(student.password, salt);
            await Student.create(student);
        }

        console.log('Database seeded successfully with authentic hashed passwords!');
        process.exit();
    })
    .catch(err => {
        console.error('Error seeding database. Make sure MongoDB is running locally.', err);
        process.exit(1);
    });
