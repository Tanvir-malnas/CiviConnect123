/**
 * Socket.IO Handler for Real-Time Civic Updates
 * 
 * Manages client connections, rooms for complaint detail streams,
 * and broadcasts events for new complaints, status transitions, and comments.
 */

let ioInstance = null;

export const initSocket = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join specific complaint room (e.g. complaint_65f...)
    socket.on('join_complaint', (complaintId) => {
      const room = `complaint_${complaintId}`;
      socket.join(room);
      console.log(`[Socket.IO] Socket ${socket.id} joined room ${room}`);
    });

    // Leave complaint room
    socket.on('leave_complaint', (complaintId) => {
      const room = `complaint_${complaintId}`;
      socket.leave(room);
      console.log(`[Socket.IO] Socket ${socket.id} left room ${room}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });
};

/**
 * Emit a newly created complaint to all connected clients (feed + admin)
 */
export const emitNewComplaint = (complaint) => {
  if (ioInstance) {
    ioInstance.emit('complaint:new', complaint);
  }
};

/**
 * Emit a status update event globally and to the specific complaint room
 */
export const emitStatusUpdate = (complaintId, newStatus, statusHistory, updatedComplaint) => {
  if (ioInstance) {
    // Broadcast to specific room for detailed page live stepper
    ioInstance.to(`complaint_${complaintId}`).emit('complaint:statusUpdate', {
      complaintId,
      newStatus,
      statusHistory,
      updatedComplaint,
    });
    // Broadcast to global feed
    ioInstance.emit('complaint:statusUpdate', {
      complaintId,
      newStatus,
      statusHistory,
      updatedComplaint,
    });
  }
};

/**
 * Emit an assignment update
 */
export const emitComplaintAssigned = (complaintId, assignmentData) => {
  if (ioInstance) {
    ioInstance.to(`complaint_${complaintId}`).emit('complaint:assigned', {
      complaintId,
      ...assignmentData,
    });
    ioInstance.emit('complaint:assigned', {
      complaintId,
      ...assignmentData,
    });
  }
};

/**
 * Emit a new comment to the complaint room and feed
 */
export const emitNewComment = (complaintId, comment) => {
  if (ioInstance) {
    ioInstance.to(`complaint_${complaintId}`).emit('complaint:comment', {
      complaintId,
      comment,
    });
  }
};

/**
 * Emit a complaint deleted event to all connected clients (feed, admin, and open rooms)
 */
export const emitComplaintDeleted = (complaintId) => {
  if (ioInstance) {
    ioInstance.to(`complaint_${complaintId}`).emit('complaint:deleted', { complaintId });
    ioInstance.emit('complaint:deleted', { complaintId });
  }
};

export const getIO = () => ioInstance;
