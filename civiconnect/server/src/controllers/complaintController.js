import Complaint from '../models/Complaint.js';
import { emitNewComplaint, emitNewComment } from '../sockets/socketHandler.js';

/**
 * @desc    Create a new complaint
 * @route   POST /api/complaints
 * @access  Private (Citizen)
 */
export const createComplaint = async (req, res) => {
  try {
    const { title, description, category, lat, lng, address } = req.body;

    if (!title || !description || !category || lat === undefined || lng === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, category, and valid location coordinates.',
      });
    }

    let photoUrl = '';
    if (req.file) {
      // Relative path accessible via static file server
      photoUrl = `/uploads/${req.file.filename}`;
    }

    const complaint = await Complaint.create({
      title,
      description,
      category,
      photoUrl,
      location: {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        address: address || 'Location unspecified',
      },
      status: 'Submitted',
      createdBy: req.user._id,
      statusHistory: [
        {
          status: 'Submitted',
          changedAt: new Date(),
          changedBy: req.user._id,
          comment: 'Complaint reported by citizen',
        },
      ],
    });

    // Populate createdBy details before returning and broadcasting
    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate('createdBy', 'name email role')
      .populate('statusHistory.changedBy', 'name role');

    // Broadcast new complaint in real time via Socket.IO
    emitNewComplaint(populatedComplaint);

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully.',
      complaint: populatedComplaint,
    });
  } catch (error) {
    console.error('[Create Complaint Error]:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit complaint.',
    });
  }
};

/**
 * @desc    Get public feed of complaints with filters & pagination
 * @route   GET /api/complaints
 * @access  Public
 */
export const getComplaints = async (req, res) => {
  try {
    const { category, status, area, search, page = 1, limit = 10 } = req.query;

    const query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (area) {
      query['location.address'] = { $regex: area, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const total = await Complaint.countDocuments(query);

    const complaints = await Complaint.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: complaints.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      complaints,
    });
  } catch (error) {
    console.error('[Get Complaints Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve complaints.',
    });
  }
};

/**
 * @desc    Get single complaint detail with full history and populated comments
 * @route   GET /api/complaints/:id
 * @access  Public
 */
export const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('createdBy', 'name email role')
      .populate('comments.user', 'name role')
      .populate('statusHistory.changedBy', 'name role')
      .populate('adminNotes.addedBy', 'name role');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      });
    }

    res.status(200).json({
      success: true,
      complaint,
    });
  } catch (error) {
    console.error('[Get Complaint By ID Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaint details.',
    });
  }
};

/**
 * @desc    Toggle upvote ("Me too") on a complaint
 * @route   POST /api/complaints/:id/upvote
 * @access  Private
 */
export const toggleUpvote = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      });
    }

    const userId = req.user._id;
    const alreadyUpvoted = complaint.upvotes.some(
      (id) => id.toString() === userId.toString()
    );

    if (alreadyUpvoted) {
      // Remove upvote
      complaint.upvotes = complaint.upvotes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      // Add upvote
      complaint.upvotes.push(userId);
    }

    await complaint.save();

    res.status(200).json({
      success: true,
      upvoted: !alreadyUpvoted,
      upvoteCount: complaint.upvotes.length,
      upvotes: complaint.upvotes,
    });
  } catch (error) {
    console.error('[Toggle Upvote Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle upvote.',
    });
  }
};

/**
 * @desc    Add a comment to a complaint
 * @route   POST /api/complaints/:id/comments
 * @access  Private
 */
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required.',
      });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      });
    }

    const newComment = {
      user: req.user._id,
      text: text.trim(),
      createdAt: new Date(),
    };

    complaint.comments.push(newComment);
    await complaint.save();

    const populatedComment = {
      ...newComment,
      _id: complaint.comments[complaint.comments.length - 1]._id,
      user: {
        _id: req.user._id,
        name: req.user.name,
        role: req.user.role,
      },
    };

    // Emit live comment to Socket.IO room
    emitNewComment(complaint._id.toString(), populatedComment);

    res.status(201).json({
      success: true,
      message: 'Comment added successfully.',
      comment: populatedComment,
    });
  } catch (error) {
    console.error('[Add Comment Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment.',
    });
  }
};

/**
 * @desc    Get all complaints submitted by the authenticated citizen
 * @route   GET /api/complaints/mine
 * @access  Private
 */
export const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ createdBy: req.user._id })
      .populate('statusHistory.changedBy', 'name role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    console.error('[Get My Complaints Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve personal complaints.',
    });
  }
};
