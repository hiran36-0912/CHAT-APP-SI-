import express from "express";
import User from "../models/User.js";
import Message from "../models/Message.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET ALL USERS FOR SIDEBAR (with last message if any)
router.get("/", protectRoute, async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // Fetch all users except the currently authenticated user
    const users = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    // Fetch latest message for each user conversation
    const usersWithLastMessage = await Promise.all(
      users.map(async (user) => {
        const lastMessage = await Message.findOne({
          $or: [
            { senderId: loggedInUserId, receiverId: user._id },
            { senderId: user._id, receiverId: loggedInUserId },
          ],
        }).sort({ createdAt: -1 });

        return {
          ...user.toObject(),
          lastMessage: lastMessage ? lastMessage.text : null,
          lastMessageTime: lastMessage ? lastMessage.createdAt : null,
        };
      })
    );

    res.status(200).json(usersWithLastMessage);
  } catch (error) {
    console.error("Error in getUsers route:", error.message);
    res.status(500).json({ message: "Server error fetching users" });
  }
});

export default router;
