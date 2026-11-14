import express from 'express';
import {
  getAllStudents,
  getStudentById,
  getMyStudentProfile,
  createStudent,
  updateStudent,
  deleteStudent,
} from '../controllers/student.controller.js';
import { protect, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/me', authorizeRoles('student', 'guardian'), getMyStudentProfile);
router.get('/', authorizeRoles('admin', 'teacher'), getAllStudents);
router.get('/:id', authorizeRoles('admin', 'teacher', 'guardian'), getStudentById);
router.post('/', authorizeRoles('admin'), createStudent);
router.put('/:id', authorizeRoles('admin'), updateStudent);
router.delete('/:id', authorizeRoles('admin'), deleteStudent);

export default router;
