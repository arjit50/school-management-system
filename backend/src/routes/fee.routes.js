import express from 'express';
import {
  getAllFees,
  createFeeInvoice,
  updateFeeStatus,
  getStudentFees,
  deleteFee,
} from '../controllers/fee.controller.js';
import { protect, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/', authorizeRoles('admin'), getAllFees);
router.post('/', authorizeRoles('admin'), createFeeInvoice);
router.patch('/:id/status', authorizeRoles('admin'), updateFeeStatus);
router.get('/student/:studentId', getStudentFees);
router.delete('/:id', authorizeRoles('admin'), deleteFee);

export default router;
