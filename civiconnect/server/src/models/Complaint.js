import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a complaint title'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a detailed description'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: ['road', 'waste', 'water', 'streetlight', 'drainage', 'other'],
    },
    photoUrl: {
      type: String,
      default: '',
    },
    location: {
      lat: {
        type: Number,
        required: [true, 'Latitude is required'],
      },
      lng: {
        type: Number,
        required: [true, 'Longitude is required'],
      },
      address: {
        type: String,
        default: 'Location unspecified',
      },
    },
    status: {
      type: String,
      enum: ['Submitted', 'Verified', 'Assigned', 'In Progress', 'Resolved', 'Rejected'],
      default: 'Submitted',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedDepartment: {
      type: String,
      default: '',
      trim: true,
    },
    assignedWorker: {
      type: String,
      default: '',
      trim: true,
    },
    adminNotes: [
      {
        note: { type: String, required: true },
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    resolutionPhotoUrl: {
      type: String,
      default: '',
    },
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        text: { type: String, required: true, trim: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    statusHistory: [
      {
        status: {
          type: String,
          enum: ['Submitted', 'Verified', 'Assigned', 'In Progress', 'Resolved', 'Rejected'],
          required: true,
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        comment: {
          type: String,
          default: '',
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Pre-save hook: auto-append initial status history when newly created
complaintSchema.pre('save', function (next) {
  if (this.isNew && (!this.statusHistory || this.statusHistory.length === 0)) {
    this.statusHistory.push({
      status: this.status || 'Submitted',
      changedAt: new Date(),
      changedBy: this.createdBy,
      comment: 'Complaint filed by citizen',
    });
  }
  next();
});

const Complaint = mongoose.model('Complaint', complaintSchema);
export default Complaint;
