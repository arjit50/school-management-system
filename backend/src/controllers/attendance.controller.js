import Attendance from '../models/attendance.model.js';
import Student from '../models/student.model.js';

// Normalize date to UTC midnight
const normalizeDate = (rawDate) => {
  const d = rawDate ? new Date(rawDate) : new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

// Mark / Upsert Attendance for a Class (Teacher, Admin)
export const markClassAttendance = async (req, res) => {
  try {
    const { classId, date, records } = req.body;

    if (!classId || !records || !Array.isArray(records)) {
      return res.status(400).json({
        message: 'classId, and an array of student attendance records are required',
      });
    }

    const attendanceDate = normalizeDate(date);

    const operations = records.map((rec) => ({
      updateOne: {
        filter: {
          student: rec.studentId,
          date: attendanceDate,
        },
        update: {
          $set: {
            class: classId,
            status: rec.status || 'Present',
            markedBy: req.user._id,
          },
        },
        upsert: true,
      },
    }));

    if (operations.length > 0) {
      await Attendance.bulkWrite(operations);
    }

    return res.status(200).json({
      success: true,
      message: `Attendance marked successfully for ${records.length} students`,
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    return res.status(500).json({ message: 'Failed to mark attendance' });
  }
};

// Get Attendance for a Class on a specific Date
export const getClassAttendanceByDate = async (req, res) => {
  try {
    const { classId } = req.params;
    const { date } = req.query;

    const attendanceDate = normalizeDate(date);

    // Get all students enrolled in this class
    const students = await Student.find({ class: classId })
      .populate('user', 'name email')
      .sort({ admissionNumber: 1 });

    // Fetch existing attendance records for that day
    const records = await Attendance.find({
      class: classId,
      date: attendanceDate,
    });

    const attendanceMap = new Map();
    records.forEach((r) => {
      attendanceMap.set(r.student.toString(), r.status);
    });

    // Merge student list with their attendance status (default 'Present' if not yet marked)
    const result = students.map((s) => ({
      studentId: s._id,
      name: s.user?.name || 'Unknown',
      admissionNumber: s.admissionNumber,
      status: attendanceMap.get(s._id.toString()) || 'Present',
      isMarked: attendanceMap.has(s._id.toString()),
    }));

    return res.status(200).json({
      success: true,
      date: attendanceDate,
      attendance: result,
    });
  } catch (error) {
    console.error('Error fetching class attendance:', error);
    return res.status(500).json({ message: 'Failed to fetch class attendance' });
  }
};

// Get Student Attendance History & Summary
export const getStudentAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Check authorization: Admin, Teacher, or the Student/Guardian themselves
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

    const records = await Attendance.find({ student: studentId })
      .populate('class', 'className section')
      .sort({ date: -1 });

    const totalDays = records.length;
    const presentCount = records.filter((r) => r.status === 'Present').length;
    const absentCount = records.filter((r) => r.status === 'Absent').length;
    const lateCount = records.filter((r) => r.status === 'Late').length;
    const percentage = totalDays > 0 ? Math.round(((presentCount + lateCount) / totalDays) * 100) : 100;

    return res.status(200).json({
      success: true,
      summary: {
        totalDays,
        presentCount,
        absentCount,
        lateCount,
        percentage,
      },
      records,
    });
  } catch (error) {
    console.error('Error fetching student attendance:', error);
    return res.status(500).json({ message: 'Failed to fetch attendance history' });
  }
};
