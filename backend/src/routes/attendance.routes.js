import express from 'express';
import {
  markClassAttendance,
  getClassAttendanceByDate,
  getStudentAttendance,
} from '../controllers/attendance.controller.js';
import { protect, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/mark', authorizeRoles('admin', 'teacher'), markClassAttendance);
router.get('/class/:classId', authorizeRoles('admin', 'teacher'), getClassAttendanceByDate);
router.get('/student/:studentId', getStudentAttendance);

export default router;
