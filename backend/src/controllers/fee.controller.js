import Fee from '../models/fee.model.js';
import Student from '../models/student.model.js';

// Get all fees (Admin)
export const getAllFees = async (req, res) => {
  try {
    const { status, classId } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    let fees = await Fee.find(filter)
      .populate({
        path: 'student',
        populate: [
          { path: 'user', select: 'name email' },
          { path: 'class', select: 'className section' },
        ],
      })
      .sort({ dueDate: 1 });

    if (classId) {
      fees = fees.filter((f) => f.student?.class?._id?.toString() === classId);
    }

    const totalAmount = fees.reduce((sum, f) => sum + (f.amount || 0), 0);
    const paidAmount = fees
      .filter((f) => f.status === 'Paid')
      .reduce((sum, f) => sum + (f.amount || 0), 0);
    const pendingAmount = totalAmount - paidAmount;

    return res.status(200).json({
      success: true,
      summary: {
        totalFeesCount: fees.length,
        totalAmount,
        paidAmount,
        pendingAmount,
      },
      fees,
    });
  } catch (error) {
    console.error('Error fetching fees:', error);
    return res.status(500).json({ message: 'Failed to fetch fees' });
  }
};

// Create fee invoice for a single student or whole class (Admin)
export const createFeeInvoice = async (req, res) => {
  try {
    const { studentId, classId, amount, dueDate } = req.body;

    if (!amount || !dueDate) {
      return res.status(400).json({ message: 'Amount and due date are required' });
    }

    if (!studentId && !classId) {
      return res.status(400).json({ message: 'Either studentId or classId must be provided' });
    }

    const targetStudents = [];

    if (studentId) {
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
      targetStudents.push(student._id);
    } else if (classId) {
      const students = await Student.find({ class: classId });
      if (students.length === 0) {
        return res.status(400).json({ message: 'No students found in this class' });
      }
      students.forEach((s) => targetStudents.push(s._id));
    }

    const feeDocs = targetStudents.map((sId) => ({
      student: sId,
      amount: Number(amount),
      dueDate: new Date(dueDate),
      status: 'Pending',
    }));

    await Fee.insertMany(feeDocs);

    return res.status(201).json({
      success: true,
      message: `Fee invoice created for ${feeDocs.length} student(s)`,
    });
  } catch (error) {
    console.error('Error creating fee invoice:', error);
    return res.status(500).json({ message: 'Failed to create fee invoice' });
  }
};

// Update fee status (Admin)
export const updateFeeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Paid', 'Pending'].includes(status)) {
      return res.status(400).json({ message: 'Status must be either Paid or Pending' });
    }

    const fee = await Fee.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate({
      path: 'student',
      populate: [
        { path: 'user', select: 'name email' },
        { path: 'class', select: 'className section' },
      ],
    });

    if (!fee) {
      return res.status(404).json({ message: 'Fee record not found' });
    }

    return res.status(200).json({
      success: true,
      message: `Fee marked as ${status}`,
      fee,
    });
  } catch (error) {
    console.error('Error updating fee status:', error);
    return res.status(500).json({ message: 'Failed to update fee status' });
  }
};

// Get fees for a student (Student, Guardian, Teacher, Admin)
export const getStudentFees = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (req.user.role === 'student') {
      const myStudent = await Student.findOne({ user: req.user._id });
      if (!myStudent || myStudent._id.toString() !== studentId) {
        return res.status(403).json({ message: 'Access denied' });
      }
    } else if (req.user.role === 'guardian') {
      const isMyWard = await Student.findOne({ _id: studentId, guardian: req.user._id });
      if (!isMyWard) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    const fees = await Fee.find({ student: studentId }).sort({ dueDate: 1 });

    const totalAmount = fees.reduce((sum, f) => sum + (f.amount || 0), 0);
    const paidAmount = fees
      .filter((f) => f.status === 'Paid')
      .reduce((sum, f) => sum + (f.amount || 0), 0);
    const pendingAmount = totalAmount - paidAmount;

    return res.status(200).json({
      success: true,
      summary: {
        totalAmount,
        paidAmount,
        pendingAmount,
      },
      fees,
    });
  } catch (error) {
    console.error('Error fetching student fees:', error);
    return res.status(500).json({ message: 'Failed to fetch student fees' });
  }
};

// Delete fee (Admin)
export const deleteFee = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Fee.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Fee record not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Fee record deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting fee:', error);
    return res.status(500).json({ message: 'Failed to delete fee' });
  }
};
