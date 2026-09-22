import express from 'express';
import {
  getAdminComplaints,
  updateComplaintStatus,
  assignComplaint,
  uploadResolutionPhoto,
  getAdminAnalytics,
  deleteComplaint,
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/adminMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Apply protect and requireAdmin to all admin endpoints
router.use(protect, requireAdmin);

router.get('/complaints', getAdminComplaints);
router.patch('/complaints/:id/status', updateComplaintStatus);
router.patch('/complaints/:id/assign', assignComplaint);
router.delete('/complaints/:id', deleteComplaint);
router.post('/complaints/:id/resolution-photo', upload.single('photo'), uploadResolutionPhoto);
router.get('/analytics', getAdminAnalytics);

export default router;
