import bcrypt from 'bcrypt';
import User from '../models/user.model.js';
import Teacher from '../models/teacher.model.js';
import Class from '../models/class.model.js';

// Get all teachers
export const getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find()
      .populate('user', 'name email role')
      .populate('assignedClasses', 'className section')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      teachers,
    });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return res.status(500).json({ message: 'Failed to fetch teachers' });
  }
};

// Get single teacher by ID
export const getTeacherById = async (req, res) => {
  try {
    const { id } = req.params;
    const teacher = await Teacher.findById(id)
      .populate('user', 'name email role')
      .populate('assignedClasses', 'className section');

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    return res.status(200).json({
      success: true,
      teacher,
    });
  } catch (error) {
    console.error('Error fetching teacher:', error);
    return res.status(500).json({ message: 'Failed to fetch teacher' });
  }
};

// Get logged-in teacher profile
export const getMyTeacherProfile = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user._id })
      .populate('user', 'name email role')
      .populate('assignedClasses', 'className section');

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }

    return res.status(200).json({
      success: true,
      teacher,
    });
  } catch (error) {
    console.error('Error fetching teacher profile:', error);
    return res.status(500).json({ message: 'Failed to fetch teacher profile' });
  }
};

// Create a new teacher (Admin only)
export const createTeacher = async (req, res) => {
  try {
    const { name, email, password, employeeId, subject, phone, assignedClasses } = req.body;

    if (!name || !email || !password || !employeeId || !subject) {
      return res.status(400).json({ message: 'Name, email, password, employee ID, and subject are required' });
    }

    // Check if user email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    // Check if employeeId already exists
    const existingTeacher = await Teacher.findOne({ employeeId: employeeId.trim() });
    if (existingTeacher) {
      return res.status(409).json({ message: 'Teacher with this employee ID already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: email.trim(),
      password: hashedPassword,
      role: 'teacher',
    });

    const teacher = await Teacher.create({
      user: user._id,
      employeeId: employeeId.trim(),
      subject: subject.trim(),
      phone: phone ? phone.trim() : '',
      assignedClasses: assignedClasses || [],
    });

    const populated = await Teacher.findById(teacher._id)
      .populate('user', 'name email role')
      .populate('assignedClasses', 'className section');

    return res.status(201).json({
      success: true,
      message: 'Teacher created successfully',
      teacher: populated,
    });
  } catch (error) {
    console.error('Error creating teacher:', error);
    return res.status(500).json({ message: 'Failed to create teacher' });
  }
};

// Update teacher (Admin only)
export const updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, subject, phone, assignedClasses } = req.body;

    const teacher = await Teacher.findById(id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Update User info if provided
    if (name || email) {
      const user = await User.findById(teacher.user);
      if (user) {
        if (name) user.name = name.trim();
        if (email) {
          const emailCheck = await User.findOne({ email: email.trim(), _id: { $ne: user._id } });
          if (emailCheck) {
            return res.status(409).json({ message: 'Email is already in use by another account' });
          }
          user.email = email.trim();
        }
        await user.save();
      }
    }

    if (subject) teacher.subject = subject.trim();
    if (phone !== undefined) teacher.phone = phone.trim();
    if (assignedClasses !== undefined) teacher.assignedClasses = assignedClasses;

    await teacher.save();

    const populated = await Teacher.findById(id)
      .populate('user', 'name email role')
      .populate('assignedClasses', 'className section');

    return res.status(200).json({
      success: true,
      message: 'Teacher updated successfully',
      teacher: populated,
    });
  } catch (error) {
    console.error('Error updating teacher:', error);
    return res.status(500).json({ message: 'Failed to update teacher' });
  }
};

// Delete teacher (Admin only)
export const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;

    const teacher = await Teacher.findById(id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Remove as class teacher from classes
    await Class.updateMany({ classTeacher: teacher.user }, { classTeacher: null });

    // Delete associated User
    await User.findByIdAndDelete(teacher.user);

    // Delete Teacher
    await Teacher.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Teacher deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    return res.status(500).json({ message: 'Failed to delete teacher' });
  }
};
