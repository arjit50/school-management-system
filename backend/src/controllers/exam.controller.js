import ExamResult from '../models/examResult.model.js';
import Student from '../models/student.model.js';

// Calculate grade helper
const calculateGrade = (percentage) => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  return 'F';
};

// Record / Batch Enter Exam Results (Teacher, Admin)
export const recordExamResults = async (req, res) => {
  try {
    const { examName, subject, totalMarks, results } = req.body;

    if (!examName || !subject || !totalMarks || !results || !Array.isArray(results)) {
      return res.status(400).json({
        message: 'examName, subject, totalMarks, and results array are required',
      });
    }

    const operations = results.map((item) => ({
      updateOne: {
        filter: {
          student: item.studentId,
          examName: examName.trim(),
          subject: subject.trim(),
        },
        update: {
          $set: {
            totalMarks: Number(totalMarks),
            obtainedMarks: Number(item.obtainedMarks),
          },
        },
        upsert: true,
      },
    }));

    if (operations.length > 0) {
      await ExamResult.bulkWrite(operations);
    }

    return res.status(200).json({
      success: true,
      message: `Exam results saved for ${results.length} students`,
    });
  } catch (error) {
    console.error('Error saving exam results:', error);
    return res.status(500).json({ message: 'Failed to record exam results' });
  }
};

// Get Exam Results for a Class (Teacher, Admin)
export const getClassExamResults = async (req, res) => {
  try {
    const { classId } = req.params;
    const { examName, subject } = req.query;

    const students = await Student.find({ class: classId })
      .populate('user', 'name email')
      .sort({ admissionNumber: 1 });

    const studentIds = students.map((s) => s._id);

    const filter = { student: { $in: studentIds } };
    if (examName) filter.examName = examName;
    if (subject) filter.subject = subject;

    const results = await ExamResult.find(filter);

    const resultMap = new Map();
    results.forEach((r) => {
      const key = `${r.student.toString()}_${r.examName}_${r.subject}`;
      resultMap.set(key, r);
    });

    const formatted = students.map((s) => {
      const studentResults = results.filter((r) => r.student.toString() === s._id.toString());
      return {
        studentId: s._id,
        name: s.user?.name || 'Unknown',
        admissionNumber: s.admissionNumber,
        results: studentResults,
      };
    });

    return res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error('Error fetching class exam results:', error);
    return res.status(500).json({ message: 'Failed to fetch class exam results' });
  }
};

// Get Student Report Card / Results (Student, Guardian, Teacher, Admin)
export const getStudentExamResults = async (req, res) => {
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

    const results = await ExamResult.find({ student: studentId }).sort({ createdAt: -1 });

    // Group by examName
    const grouped = {};
    let grandTotalMarks = 0;
    let grandObtainedMarks = 0;

    results.forEach((r) => {
      if (!grouped[r.examName]) {
        grouped[r.examName] = [];
      }
      const pct = Math.round((r.obtainedMarks / r.totalMarks) * 100);
      grouped[r.examName].push({
        _id: r._id,
        subject: r.subject,
        totalMarks: r.totalMarks,
        obtainedMarks: r.obtainedMarks,
        percentage: pct,
        grade: calculateGrade(pct),
      });

      grandTotalMarks += r.totalMarks;
      grandObtainedMarks += r.obtainedMarks;
    });

    const overallPercentage =
      grandTotalMarks > 0 ? Math.round((grandObtainedMarks / grandTotalMarks) * 100) : 0;

    return res.status(200).json({
      success: true,
      summary: {
        totalSubjects: results.length,
        grandTotalMarks,
        grandObtainedMarks,
        overallPercentage,
        overallGrade: calculateGrade(overallPercentage),
      },
      exams: grouped,
    });
  } catch (error) {
    console.error('Error fetching student exam results:', error);
    return res.status(500).json({ message: 'Failed to fetch exam results' });
  }
};

// Delete Exam Result (Admin only)
export const deleteExamResult = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ExamResult.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Exam result not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Exam result deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting exam result:', error);
    return res.status(500).json({ message: 'Failed to delete exam result' });
  }
};
