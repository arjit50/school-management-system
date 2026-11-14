import Student from '../models/student.model.js';
import Teacher from '../models/teacher.model.js';
import Class from '../models/class.model.js';
import Attendance from '../models/attendance.model.js';
import Fee from '../models/fee.model.js';
import ExamResult from '../models/examResult.model.js';

export const getDashboardStats = async (req, res) => {
  try {
    const user = req.user;

    // ADMIN STATS
    if (user.role === 'admin') {
      const [totalStudents, totalTeachers, totalClasses, allFees] = await Promise.all([
        Student.countDocuments(),
        Teacher.countDocuments(),
        Class.countDocuments(),
        Fee.find(),
      ]);

      // Today's attendance
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const todayAttendance = await Attendance.find({ date: today });
      const presentToday = todayAttendance.filter((a) => a.status === 'Present').length;
      const attendanceRate =
        todayAttendance.length > 0 ? Math.round((presentToday / todayAttendance.length) * 100) : 0;

      // Fees stats
      const totalFeesAmount = allFees.reduce((sum, f) => sum + (f.amount || 0), 0);
      const paidFeesAmount = allFees
        .filter((f) => f.status === 'Paid')
        .reduce((sum, f) => sum + (f.amount || 0), 0);
      const pendingFeesAmount = totalFeesAmount - paidFeesAmount;

      const recentStudents = await Student.find()
        .populate('user', 'name email')
        .populate('class', 'className section')
        .sort({ createdAt: -1 })
        .limit(5);

      return res.status(200).json({
        success: true,
        stats: {
          totalStudents,
          totalTeachers,
          totalClasses,
          todayAttendanceRate: attendanceRate,
          todayAttendanceCount: todayAttendance.length,
          totalFeesAmount,
          paidFeesAmount,
          pendingFeesAmount,
          recentStudents,
        },
      });
    }

    // TEACHER STATS
    if (user.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: user._id }).populate(
        'assignedClasses',
        'className section'
      );

      if (!teacher) {
        return res.status(404).json({ message: 'Teacher profile not found' });
      }

      const assignedClassIds = teacher.assignedClasses.map((c) => c._id);
      const totalStudents = await Student.countDocuments({
        class: { $in: assignedClassIds },
      });

      // Today's attendance for assigned classes
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const todayAttendance = await Attendance.find({
        class: { $in: assignedClassIds },
        date: today,
      });

      return res.status(200).json({
        success: true,
        stats: {
          teacherProfile: teacher,
          assignedClassesCount: teacher.assignedClasses.length,
          totalStudents,
          todayAttendanceMarked: todayAttendance.length > 0,
        },
      });
    }

    // STUDENT STATS
    if (user.role === 'student') {
      const student = await Student.findOne({ user: user._id }).populate(
        'class',
        'className section'
      );

      if (!student) {
        return res.status(404).json({ message: 'Student profile not found' });
      }

      const [attendanceRecords, feeRecords, examResults] = await Promise.all([
        Attendance.find({ student: student._id }),
        Fee.find({ student: student._id }),
        ExamResult.find({ student: student._id }).sort({ createdAt: -1 }),
      ]);

      const totalDays = attendanceRecords.length;
      const presentDays = attendanceRecords.filter((a) => a.status === 'Present').length;
      const attendancePercentage =
        totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

      const pendingFees = feeRecords.filter((f) => f.status === 'Pending');
      const totalPendingFeeAmount = pendingFees.reduce((sum, f) => sum + (f.amount || 0), 0);

      return res.status(200).json({
        success: true,
        stats: {
          student,
          attendancePercentage,
          totalDaysRecorded: totalDays,
          pendingFeesCount: pendingFees.length,
          totalPendingFeeAmount,
          totalExamsRecorded: examResults.length,
          recentExams: examResults.slice(0, 5),
        },
      });
    }

    // GUARDIAN STATS
    if (user.role === 'guardian') {
      const wards = await Student.find({ guardian: user._id }).populate(
        'class',
        'className section'
      );

      const wardsData = await Promise.all(
        wards.map(async (ward) => {
          const [attendanceRecords, fees] = await Promise.all([
            Attendance.find({ student: ward._id }),
            Fee.find({ student: ward._id, status: 'Pending' }),
          ]);

          const totalDays = attendanceRecords.length;
          const presentDays = attendanceRecords.filter((a) => a.status === 'Present').length;
          const attendancePercentage =
            totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;
          const pendingFeeAmount = fees.reduce((sum, f) => sum + (f.amount || 0), 0);

          return {
            student: ward,
            attendancePercentage,
            pendingFeeAmount,
            pendingFeesCount: fees.length,
          };
        })
      );

      return res.status(200).json({
        success: true,
        stats: {
          wardsCount: wards.length,
          wards: wardsData,
        },
      });
    }

    return res.status(400).json({ message: 'Invalid role' });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
};
