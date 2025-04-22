import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import productRoutes from './routes/product.route.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/userRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import Message from './models/Message.js';
import mongoose from 'mongoose';

// Load .env from parent directory
dotenv.config({ path: '../.env' });

if (!process.env.MONGO_URI) {
  console.error("Error: MONGO_URI is not defined in your .env file.");
  process.exit(1);
}

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
});

// Track users: userId -> socketId
const onlineUsers = new Map();

const broadcastOnlineUsers = () => {
  io.emit('online_users', Array.from(onlineUsers.keys()));
};

io.on('connection', (socket) => {
  console.log("New socket connection:", socket.id);

  socket.on('user_connected', (userId) => {
    console.log(`User ${userId} connected with socket ${socket.id}`);

    // Remove any existing socket for this user
    for (const [existingUserId, existingSocketId] of onlineUsers.entries()) {
      if (existingUserId === userId) {
        onlineUsers.delete(existingUserId);
        io.to(existingSocketId).disconnectSockets(true); // Disconnect the old socket
        break;
      }
    }

    onlineUsers.set(userId, socket.id);
    broadcastOnlineUsers();
  });

  socket.on('disconnect', () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    broadcastOnlineUsers();
  });

  // Typing indicator
  socket.on('typing', ({ from, to }) => {
    const toSocket = onlineUsers.get(to);
    if (toSocket) {
      io.to(toSocket).emit('typing', { from, to }); // include both from and to
    }
  });
  socket.on('stop_typing', ({ from, to }) => {
    const toSocket = onlineUsers.get(to);
    if (toSocket) {
      io.to(toSocket).emit('stop_typing', { from, to }); // include both from and to
    }
  });

  // Only emit messages, do not save to DB here!
  socket.on('send_message', (msg) => {
    // msg: { senderId, receiverId, content, _id, createdAt }
    const receiverSocketId = onlineUsers.get(msg.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receive_message', msg);
    }
    // Also emit to sender for confirmation (optional)
    socket.emit('receive_message', msg);
  });
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Routes
app.use("/api/products", productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/messages', messageRoutes);

server.listen(PORT, () => {
  connectDB();
  console.log("Server is running at http://localhost:" + PORT);
});