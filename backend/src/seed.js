import 'dotenv/config';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import dbConnect from './config/db.js';
import User from './models/user.model.js';
import Class from './models/class.model.js';
import Teacher from './models/teacher.model.js';
import Student from './models/student.model.js';
import Attendance from './models/attendance.model.js';
import ExamResult from './models/examResult.model.js';
import Fee from './models/fee.model.js';

const seedDatabase = async () => {
  try {
    await dbConnect();
    console.log('Connected to MongoDB. Starting database seed...');

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      Class.deleteMany({}),
      Teacher.deleteMany({}),
      Student.deleteMany({}),
      Attendance.deleteMany({}),
      ExamResult.deleteMany({}),
      Fee.deleteMany({}),
    ]);

    console.log('Cleared existing database records.');

    // 1. Create Admin
    const adminPassword = await bcrypt.hash('admin1234', 10);
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@school.com',
      password: adminPassword,
      role: 'admin',
    });
    console.log('Created Admin: admin@school.com (Password: admin1234)');

    // 2. Create Teacher User & Teacher Profile
    const teacherPassword = await bcrypt.hash('teacher1234', 10);
    const teacherUser = await User.create({
      name: 'Sarah Connor',
      email: 'teacher@school.com',
      password: teacherPassword,
      role: 'teacher',
    });

    // 3. Create Class
    const class10A = await Class.create({
      className: 'Grade 10',
      section: 'A',
      classTeacher: teacherUser._id,
    });

    const teacher = await Teacher.create({
      user: teacherUser._id,
      employeeId: 'EMP-001',
      subject: 'Mathematics',
      phone: '+1 555-0199',
      assignedClasses: [class10A._id],
    });
    console.log('Created Teacher: teacher@school.com (Password: teacher1234)');
    console.log('Created Class: Grade 10 - Section A');

    // 4. Create Guardian
    const guardianPassword = await bcrypt.hash('guardian1234', 10);
    const guardianUser = await User.create({
      name: 'Robert Davis',
      email: 'guardian@school.com',
      password: guardianPassword,
      role: 'guardian',
    });
    console.log('Created Guardian: guardian@school.com (Password: guardian1234)');

    // 5. Create Student
    const studentPassword = await bcrypt.hash('student1234', 10);
    const studentUser = await User.create({
      name: 'Alex Davis',
      email: 'student@school.com',
      password: studentPassword,
      role: 'student',
    });

    const student = await Student.create({
      user: studentUser._id,
      admissionNumber: 'STU-2026-001',
      class: class10A._id,
      guardian: guardianUser._id,
      gender: 'Male',
      phone: '+1 555-0144',
      address: '742 Evergreen Terrace',
    });
    console.log('Created Student: student@school.com (Password: student1234)');

    // 6. Create Attendance Record
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    await Attendance.create({
      student: student._id,
      class: class10A._id,
      date: today,
      status: 'Present',
      markedBy: teacherUser._id,
    });

    // 7. Create Exam Results
    await ExamResult.create([
      {
        student: student._id,
        examName: 'Midterm Examination',
        subject: 'Mathematics',
        totalMarks: 100,
        obtainedMarks: 94,
      },
      {
        student: student._id,
        examName: 'Midterm Examination',
        subject: 'Science',
        totalMarks: 100,
        obtainedMarks: 88,
      },
    ]);

    // 8. Create Fee Invoice
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);
    await Fee.create({
      student: student._id,
      amount: 350,
      dueDate,
      status: 'Pending',
    });

    console.log('\n=========================================');
    console.log('Database seeded successfully!');
    console.log('Test Accounts available:');
    console.log('Admin:    admin@school.com    / admin1234');
    console.log('Teacher:  teacher@school.com  / teacher1234');
    console.log('Student:  student@school.com  / student1234');
    console.log('Guardian: guardian@school.com / guardian1234');
    console.log('=========================================\n');

    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedDatabase();
