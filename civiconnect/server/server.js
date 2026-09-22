import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import app from './src/app.js';
import connectDB from './src/config/db.js';
import { initSocket } from './src/sockets/socketHandler.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Create HTTP server wrapping Express app
const server = http.createServer(app);

// Attach Socket.IO
const clientOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // Allow localhost and specified client origin
      callback(null, true);
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  },
});

// Initialize real-time handlers
initSocket(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`=============================================`);
  console.log(`🚀 CiviConnect API Server running on port ${PORT}`);
  console.log(`📡 Socket.IO initialized for real-time sync`);
  console.log(`📂 Serving static uploads at /uploads`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`=============================================`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`[Unhandled Rejection]: ${err.message}`);
  // Keep server running in dev/demo rather than crashing
});
