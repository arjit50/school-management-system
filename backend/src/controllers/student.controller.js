import bcrypt from 'bcrypt';
import User from '../models/user.model.js';
import Student from '../models/student.model.js';
import Attendance from '../models/attendance.model.js';
import ExamResult from '../models/examResult.model.js';
import Fee from '../models/fee.model.js';

// Get all students (Admin, Teacher)
export const getAllStudents = async (req, res) => {
  try {
    const { classId, search } = req.query;
    const filter = {};

    if (classId) {
      filter.class = classId;
    }

    let students = await Student.find(filter)
      .populate('user', 'name email role')
      .populate('class', 'className section')
      .populate('guardian', 'name email')
      .sort({ createdAt: -1 });

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      students = students.filter(
        (s) =>
          s.admissionNumber?.match(searchRegex) ||
          s.user?.name?.match(searchRegex) ||
          s.user?.email?.match(searchRegex)
      );
    }

    return res.status(200).json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    return res.status(500).json({ message: 'Failed to fetch students' });
  }
};

// Get single student by ID
export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id)
      .populate('user', 'name email role')
      .populate('class', 'className section')
      .populate('guardian', 'name email');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    return res.status(200).json({
      success: true,
      student,
    });
  } catch (error) {
    console.error('Error fetching student:', error);
    return res.status(500).json({ message: 'Failed to fetch student' });
  }
};

// Get current student profile or guardian's wards
export const getMyStudentProfile = async (req, res) => {
  try {
    if (req.user.role === 'student') {
      const student = await Student.findOne({ user: req.user._id })
        .populate('user', 'name email role')
        .populate('class', 'className section')
        .populate('guardian', 'name email');

      if (!student) {
        return res.status(404).json({ message: 'Student profile not found' });
      }

      return res.status(200).json({
        success: true,
        student,
      });
    }

    if (req.user.role === 'guardian') {
      const students = await Student.find({ guardian: req.user._id })
        .populate('user', 'name email role')
        .populate('class', 'className section')
        .populate('guardian', 'name email');

      return res.status(200).json({
        success: true,
        students,
      });
    }

    return res.status(403).json({ message: 'Not authorized for this resource' });
  } catch (error) {
    console.error('Error fetching student profile:', error);
    return res.status(500).json({ message: 'Failed to fetch profile' });
  }
};

// Create student (Admin only)
export const createStudent = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      admissionNumber,
      classId,
      guardianId,
      dateOfBirth,
      gender,
      phone,
      address,
    } = req.body;

    if (!name || !email || !password || !admissionNumber || !classId) {
      return res.status(400).json({
        message: 'Name, email, password, admission number, and class are required',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.trim() });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    // Check if admission number exists
    const existingAdmission = await Student.findOne({ admissionNumber: admissionNumber.trim() });
    if (existingAdmission) {
      return res.status(409).json({ message: 'Student with this admission number already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: email.trim(),
      password: hashedPassword,
      role: 'student',
    });

    const student = await Student.create({
      user: user._id,
      admissionNumber: admissionNumber.trim(),
      class: classId,
      guardian: guardianId || null,
      dateOfBirth: dateOfBirth || null,
      gender: gender || 'Male',
      phone: phone ? phone.trim() : '',
      address: address ? address.trim() : '',
    });

    const populated = await Student.findById(student._id)
      .populate('user', 'name email role')
      .populate('class', 'className section')
      .populate('guardian', 'name email');

    return res.status(201).json({
      success: true,
      message: 'Student created successfully',
      student: populated,
    });
  } catch (error) {
    console.error('Error creating student:', error);
    return res.status(500).json({ message: 'Failed to create student' });
  }
};

// Update student (Admin only)
export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      admissionNumber,
      classId,
      guardianId,
      dateOfBirth,
      gender,
      phone,
      address,
    } = req.body;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (name || email) {
      const user = await User.findById(student.user);
      if (user) {
        if (name) user.name = name.trim();
        if (email) {
          const emailCheck = await User.findOne({ email: email.trim(), _id: { $ne: user._id } });
          if (emailCheck) {
            return res.status(409).json({ message: 'Email already used by another account' });
          }
          user.email = email.trim();
        }
        await user.save();
      }
    }

    if (admissionNumber && admissionNumber.trim() !== student.admissionNumber) {
      const duplicate = await Student.findOne({
        admissionNumber: admissionNumber.trim(),
        _id: { $ne: id },
      });
      if (duplicate) {
        return res.status(409).json({ message: 'Admission number already in use' });
      }
      student.admissionNumber = admissionNumber.trim();
    }

    if (classId) student.class = classId;
    if (guardianId !== undefined) student.guardian = guardianId || null;
    if (dateOfBirth !== undefined) student.dateOfBirth = dateOfBirth || null;
    if (gender) student.gender = gender;
    if (phone !== undefined) student.phone = phone.trim();
    if (address !== undefined) student.address = address.trim();

    await student.save();

    const populated = await Student.findById(id)
      .populate('user', 'name email role')
      .populate('class', 'className section')
      .populate('guardian', 'name email');

    return res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      student: populated,
    });
  } catch (error) {
    console.error('Error updating student:', error);
    return res.status(500).json({ message: 'Failed to update student' });
  }
};

// Delete student (Admin only)
export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Cleanup associated data
    await Attendance.deleteMany({ student: id });
    await ExamResult.deleteMany({ student: id });
    await Fee.deleteMany({ student: id });

    // Delete User
    await User.findByIdAndDelete(student.user);

    // Delete Student
    await Student.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Student and related records deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    return res.status(500).json({ message: 'Failed to delete student' });
  }
};
