import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

// SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const { fullName, username, email, password } = req.body;

    if (!fullName || !username || !email || !password) {
      return res.status(400).json({ message: "Please fill in all required fields" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
    });

    if (existingUser) {
      return res.status(400).json({ message: "Username or Email is already taken" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate avatar using Dicebear API based on username
    const profilePic = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`;

    const newUser = new User({
      fullName,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
      profilePic,
    });

    await newUser.save();

    const token = generateToken(newUser._id, res);

    res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      username: newUser.username,
      email: newUser.email,
      profilePic: newUser.profilePic,
      token,
    });
  } catch (error) {
    console.error("Error in signup route:", error.message);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;

    if (!usernameOrEmail || !password) {
      return res.status(400).json({ message: "Please provide credentials and password" });
    }

    const user = await User.findOne({
      $or: [
        { email: usernameOrEmail.toLowerCase() },
        { username: usernameOrEmail.toLowerCase() },
      ],
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid username/email or password" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid username/email or password" });
    }

    const token = generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic,
      token,
    });
  } catch (error) {
    console.error("Error in login route:", error.message);
    res.status(500).json({ message: "Server error during login" });
  }
});

// LOGOUT
router.post("/logout", (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error in logout route:", error.message);
    res.status(500).json({ message: "Server error during logout" });
  }
});

// GET CURRENT USER PROFILE
router.get("/me", protectRoute, async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.error("Error in me route:", error.message);
    res.status(500).json({ message: "Server error retrieving user data" });
  }
});

export default router;
