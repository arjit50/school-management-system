import express from 'express';
import {
  getAllTeachers,
  getTeacherById,
  getMyTeacherProfile,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from '../controllers/teacher.controller.js';
import { protect, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/me', authorizeRoles('teacher'), getMyTeacherProfile);
router.get('/', authorizeRoles('admin', 'teacher'), getAllTeachers);
router.get('/:id', authorizeRoles('admin', 'teacher'), getTeacherById);
router.post('/', authorizeRoles('admin'), createTeacher);
router.put('/:id', authorizeRoles('admin'), updateTeacher);
router.delete('/:id', authorizeRoles('admin'), deleteTeacher);

export default router;
