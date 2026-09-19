import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // Allow any origin in production or development to avoid WebSocket connection drops
      callback(null, true);
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Mapping userId -> socketId
const userSocketMap = {};

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
    console.log(`[Socket Connected] User ${userId} with socket ${socket.id}`);
  }

  // Broadcast the list of currently online user IDs to all clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Handle typing indicator
  socket.on("typing", ({ toUserId }) => {
    const receiverSocketId = getReceiverSocketId(toUserId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("userTyping", { fromUserId: userId });
    }
  });

  socket.on("stopTyping", ({ toUserId }) => {
    const receiverSocketId = getReceiverSocketId(toUserId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("userStoppedTyping", { fromUserId: userId });
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    if (userId && userSocketMap[userId]) {
      delete userSocketMap[userId];
      console.log(`[Socket Disconnected] User ${userId}`);
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, io, server };
