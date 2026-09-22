import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Complaint from '../models/Complaint.js';
import { emitStatusUpdate, emitComplaintAssigned, emitComplaintDeleted } from '../sockets/socketHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @desc    Get all complaints with advanced filters for administrators
 * @route   GET /api/admin/complaints
 * @access  Private (Admin)
 */
export const getAdminComplaints = async (req, res) => {
  try {
    const {
      category,
      status,
      department,
      search,
      dateFrom,
      dateTo,
      page = 1,
      limit = 50,
    } = req.query;

    const query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (department && department !== 'all') {
      query.assignedDepartment = department;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } },
        { assignedWorker: { $regex: search, $options: 'i' } },
      ];
    }

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) {
        query.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        // Set to end of day if only date is passed
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        query.createdAt.$lte = toDate;
      }
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const total = await Complaint.countDocuments(query);

    const complaints = await Complaint.find(query)
      .populate('createdBy', 'name email')
      .populate('statusHistory.changedBy', 'name role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      complaints,
    });
  } catch (error) {
    console.error('[Admin Get Complaints Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve administrative complaint list.',
    });
  }
};

/**
 * @desc    Update complaint status & append audit note
 * @route   PATCH /api/admin/complaints/:id/status
 * @access  Private (Admin)
 */
export const updateComplaintStatus = async (req, res) => {
  try {
    const { status, note } = req.body;

    const validStatuses = ['Submitted', 'Verified', 'Assigned', 'In Progress', 'Resolved', 'Rejected'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      });
    }

    // Update status
    complaint.status = status;

    // Append to status history
    complaint.statusHistory.push({
      status,
      changedAt: new Date(),
      changedBy: req.user._id,
      comment: note || `Status updated to ${status}`,
    });

    // If an administrative note was provided, save it
    if (note && note.trim()) {
      complaint.adminNotes.push({
        note: note.trim(),
        addedBy: req.user._id,
        createdAt: new Date(),
      });
    }

    await complaint.save();

    const updatedComplaint = await Complaint.findById(complaint._id)
      .populate('createdBy', 'name email role')
      .populate('statusHistory.changedBy', 'name role')
      .populate('adminNotes.addedBy', 'name role');

    // Real-time broadcast
    emitStatusUpdate(
      complaint._id.toString(),
      status,
      updatedComplaint.statusHistory,
      updatedComplaint
    );

    res.status(200).json({
      success: true,
      message: `Status updated to ${status}`,
      complaint: updatedComplaint,
    });
  } catch (error) {
    console.error('[Update Status Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update complaint status.',
    });
  }
};

/**
 * @desc    Assign municipal department and/or worker
 * @route   PATCH /api/admin/complaints/:id/assign
 * @access  Private (Admin)
 */
export const assignComplaint = async (req, res) => {
  try {
    const { department, worker } = req.body;

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      });
    }

    if (department) complaint.assignedDepartment = department;
    if (worker !== undefined) complaint.assignedWorker = worker;

    // Auto update status to Assigned if currently Submitted or Verified
    if (complaint.status === 'Submitted' || complaint.status === 'Verified') {
      complaint.status = 'Assigned';
      complaint.statusHistory.push({
        status: 'Assigned',
        changedAt: new Date(),
        changedBy: req.user._id,
        comment: `Assigned to ${department || 'Department'}${worker ? ` (Worker: ${worker})` : ''}`,
      });
    }

    await complaint.save();

    const updatedComplaint = await Complaint.findById(complaint._id)
      .populate('createdBy', 'name email')
      .populate('statusHistory.changedBy', 'name role');

    // Real-time broadcast
    emitComplaintAssigned(complaint._id.toString(), {
      assignedDepartment: complaint.assignedDepartment,
      assignedWorker: complaint.assignedWorker,
      status: complaint.status,
      statusHistory: updatedComplaint.statusHistory,
    });

    res.status(200).json({
      success: true,
      message: 'Department & personnel assigned successfully.',
      complaint: updatedComplaint,
    });
  } catch (error) {
    console.error('[Assign Complaint Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign complaint.',
    });
  }
};

/**
 * @desc    Upload proof of resolution photo
 * @route   POST /api/admin/complaints/:id/resolution-photo
 * @access  Private (Admin)
 */
export const uploadResolutionPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file as proof of resolution.',
      });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      });
    }

    complaint.resolutionPhotoUrl = `/uploads/${req.file.filename}`;
    
    // If optional status change passed or defaults to Resolved
    if (req.body.markResolved === 'true' || req.body.markResolved === true) {
      complaint.status = 'Resolved';
      complaint.statusHistory.push({
        status: 'Resolved',
        changedAt: new Date(),
        changedBy: req.user._id,
        comment: 'Resolution photo uploaded and verified by municipal admin',
      });
    }

    await complaint.save();

    const updatedComplaint = await Complaint.findById(complaint._id)
      .populate('createdBy', 'name email')
      .populate('statusHistory.changedBy', 'name role');

    emitStatusUpdate(
      complaint._id.toString(),
      complaint.status,
      updatedComplaint.statusHistory,
      updatedComplaint
    );

    res.status(200).json({
      success: true,
      message: 'Resolution proof photo uploaded successfully.',
      resolutionPhotoUrl: complaint.resolutionPhotoUrl,
      complaint: updatedComplaint,
    });
  } catch (error) {
    console.error('[Upload Resolution Photo Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload resolution proof.',
    });
  }
};

/**
 * @desc    Get aggregated analytics for municipal leadership
 * @route   GET /api/admin/analytics
 * @access  Private (Admin)
 */
export const getAdminAnalytics = async (req, res) => {
  try {
    // 1. Total count
    const totalComplaints = await Complaint.countDocuments();

    // 2. Count by status
    const statusCountsRaw = await Complaint.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const allStatuses = ['Submitted', 'Verified', 'Assigned', 'In Progress', 'Resolved', 'Rejected'];
    const statusCounts = allStatuses.map((st) => {
      const match = statusCountsRaw.find((item) => item._id === st);
      return {
        status: st,
        count: match ? match.count : 0,
      };
    });

    // 3. Count by category
    const categoryCountsRaw = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const allCategories = ['road', 'waste', 'water', 'streetlight', 'drainage', 'other'];
    const categoryCounts = allCategories.map((cat) => {
      const match = categoryCountsRaw.find((item) => item._id === cat);
      return {
        category: cat,
        count: match ? match.count : 0,
      };
    });

    // 4. Calculate average resolution time for Resolved complaints
    const resolvedComplaints = await Complaint.find({ status: 'Resolved' });
    let totalResolutionHours = 0;
    let resolvedCount = 0;

    resolvedComplaints.forEach((c) => {
      // Find the statusHistory entry where status === 'Resolved'
      const resolvedEntry = c.statusHistory
        .slice()
        .reverse()
        .find((h) => h.status === 'Resolved');

      const resolvedTime = resolvedEntry ? new Date(resolvedEntry.changedAt) : new Date(c.updatedAt);
      const createdTime = new Date(c.createdAt);
      // For seed data, timestamps in statusHistory can precede record insertion
      const diffInHours = Math.abs((resolvedTime - createdTime) / (1000 * 60 * 60));

      totalResolutionHours += diffInHours;
      resolvedCount += 1;
    });

    const avgResolutionHours = resolvedCount > 0 ? (totalResolutionHours / resolvedCount).toFixed(1) : '0';
    const avgResolutionDays = resolvedCount > 0 ? (totalResolutionHours / (resolvedCount * 24)).toFixed(1) : '0';

    // 5. Recent department assignments
    const departmentCountsRaw = await Complaint.aggregate([
      { $match: { assignedDepartment: { $ne: '' } } },
      { $group: { _id: '$assignedDepartment', count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        totalComplaints,
        statusCounts,
        categoryCounts,
        departmentCounts: departmentCountsRaw.map((d) => ({ department: d._id, count: d.count })),
        resolutionStats: {
          resolvedCount,
          avgResolutionHours: parseFloat(avgResolutionHours),
          avgResolutionDays: parseFloat(avgResolutionDays),
        },
      },
    });
  } catch (error) {
    console.error('[Admin Analytics Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate civic analytics.',
    });
  }
};

/**
 * @desc    Delete a complaint (Admin only)
 * @route   DELETE /api/admin/complaints/:id
 * @access  Private (Admin)
 */
export const deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      });
    }

    // Clean up local uploaded photos if any
    const deleteLocalFile = (fileRelPath) => {
      if (fileRelPath && fileRelPath.startsWith('/uploads/')) {
        const fullPath = path.join(__dirname, '../../', fileRelPath);
        if (fs.existsSync(fullPath)) {
          try {
            fs.unlinkSync(fullPath);
          } catch (e) {
            console.warn('[Delete Complaint] Could not delete image file:', fullPath, e.message);
          }
        }
      }
    };

    deleteLocalFile(complaint.photoUrl);
    deleteLocalFile(complaint.resolutionPhotoUrl);

    await Complaint.findByIdAndDelete(req.params.id);

    // Broadcast deletion in real time to feed, admin console, and open views
    emitComplaintDeleted(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Complaint permanently removed.',
      complaintId: req.params.id,
    });
  } catch (error) {
    console.error('[Delete Complaint Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete complaint.',
    });
  }
};

