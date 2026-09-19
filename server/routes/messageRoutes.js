import express from "express";
import Message from "../models/Message.js";
import { protectRoute } from "../middleware/authMiddleware.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

const router = express.Router();

// GET MESSAGES BETWEEN CURRENT USER AND SELECTED USER
router.get("/:id", protectRoute, async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages route:", error.message);
    res.status(500).json({ message: "Server error retrieving messages" });
  }
});

// SEND MESSAGE TO USER
router.post("/send/:id", protectRoute, async (req, res) => {
  try {
    const { text } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Message text cannot be empty" });
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text: text.trim(),
    });

    await newMessage.save();

    // Real-time broadcast to receiver if currently connected via Socket.io
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage route:", error.message);
    res.status(500).json({ message: "Server error sending message" });
  }
});

export default router;
