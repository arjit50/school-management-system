import express from 'express';
import { getUsersByRole } from '../controllers/user.controller.js';
import { protect, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.get('/', authorizeRoles('admin'), getUsersByRole);

export default router;
