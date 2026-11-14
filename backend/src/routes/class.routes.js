import express from 'express';
import {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
} from '../controllers/class.controller.js';
import { protect, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getAllClasses);
router.get('/:id', getClassById);
router.post('/', authorizeRoles('admin'), createClass);
router.put('/:id', authorizeRoles('admin'), updateClass);
router.delete('/:id', authorizeRoles('admin'), deleteClass);

export default router;
