import express from 'express';
import {
  createComplaint,
  getComplaints,
  getComplaintById,
  toggleUpvote,
  addComment,
  getMyComplaints,
} from '../controllers/complaintController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public complaint listing & citizen creation
router
  .route('/')
  .get(getComplaints)
  .post(protect, upload.single('photo'), createComplaint);

// User's own complaints (must precede :id route to prevent param collisions)
router.get('/mine', protect, getMyComplaints);

// Single complaint detail
router.get('/:id', getComplaintById);

// Interactive features
router.post('/:id/upvote', protect, toggleUpvote);
router.post('/:id/comments', protect, addComment);

export default router;
