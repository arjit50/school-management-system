import express from 'express';
import {
  recordExamResults,
  getClassExamResults,
  getStudentExamResults,
  deleteExamResult,
} from '../controllers/exam.controller.js';
import { protect, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/record', authorizeRoles('admin', 'teacher'), recordExamResults);
router.get('/class/:classId', authorizeRoles('admin', 'teacher'), getClassExamResults);
router.get('/student/:studentId', getStudentExamResults);
router.delete('/:id', authorizeRoles('admin'), deleteExamResult);

export default router;
