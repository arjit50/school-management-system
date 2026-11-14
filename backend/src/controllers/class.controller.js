import Class from '../models/class.model.js';
import Student from '../models/student.model.js';

// Get all classes
export const getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find()
      .populate('classTeacher', 'name email')
      .sort({ className: 1, section: 1 });

    // Include student count for each class
    const classesWithCount = await Promise.all(
      classes.map(async (cls) => {
        const studentCount = await Student.countDocuments({ class: cls._id });
        return {
          ...cls.toObject(),
          studentCount,
        };
      })
    );

    return res.status(200).json({
      success: true,
      classes: classesWithCount,
    });
  } catch (error) {
    console.error('Error fetching classes:', error);
    return res.status(500).json({ message: 'Failed to fetch classes' });
  }
};

// Get single class by ID
export const getClassById = async (req, res) => {
  try {
    const { id } = req.params;
    const classItem = await Class.findById(id).populate('classTeacher', 'name email');

    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const students = await Student.find({ class: id })
      .populate('user', 'name email')
      .populate('guardian', 'name email');

    return res.status(200).json({
      success: true,
      class: classItem,
      students,
    });
  } catch (error) {
    console.error('Error fetching class details:', error);
    return res.status(500).json({ message: 'Failed to fetch class details' });
  }
};

// Create a new class
export const createClass = async (req, res) => {
  try {
    const { className, section, classTeacher } = req.body;

    if (!className || !section) {
      return res.status(400).json({ message: 'Class name and section are required' });
    }

    const trimmedClassName = className.trim();
    const upperSection = section.trim().toUpperCase();

    const existingClass = await Class.findOne({
      className: trimmedClassName,
      section: upperSection,
    });

    if (existingClass) {
      return res.status(409).json({ message: 'A class with this name and section already exists' });
    }

    const newClass = await Class.create({
      className: trimmedClassName,
      section: upperSection,
      classTeacher: classTeacher || null,
    });

    const populatedClass = await Class.findById(newClass._id).populate('classTeacher', 'name email');

    return res.status(201).json({
      success: true,
      message: 'Class created successfully',
      class: populatedClass,
    });
  } catch (error) {
    console.error('Error creating class:', error);
    return res.status(500).json({ message: 'Failed to create class' });
  }
};

// Update class
export const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { className, section, classTeacher } = req.body;

    const classItem = await Class.findById(id);
    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }

    if (className) classItem.className = className.trim();
    if (section) classItem.section = section.trim().toUpperCase();
    if (classTeacher !== undefined) classItem.classTeacher = classTeacher || null;

    // Check if new className + section conflicts with another class
    const duplicate = await Class.findOne({
      _id: { $ne: id },
      className: classItem.className,
      section: classItem.section,
    });

    if (duplicate) {
      return res.status(409).json({ message: 'Another class already has this name and section' });
    }

    await classItem.save();
    const populated = await Class.findById(id).populate('classTeacher', 'name email');

    return res.status(200).json({
      success: true,
      message: 'Class updated successfully',
      class: populated,
    });
  } catch (error) {
    console.error('Error updating class:', error);
    return res.status(500).json({ message: 'Failed to update class' });
  }
};

// Delete class
export const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;

    const enrolledStudents = await Student.countDocuments({ class: id });
    if (enrolledStudents > 0) {
      return res.status(400).json({
        message: `Cannot delete class. There are ${enrolledStudents} students enrolled in it. Reassign them first.`,
      });
    }

    const deleted = await Class.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Class not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Class deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting class:', error);
    return res.status(500).json({ message: 'Failed to delete class' });
  }
};
