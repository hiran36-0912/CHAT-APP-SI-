import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import fs from "fs";

// Load environment variables from root or local
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, ".env") });

import { connectDB } from "./config/db.js";
import { app, server } from "./socket/socket.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((url) => url.trim())
  : [
      "http://localhost:5173",
      "http://localhost:5000",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5000",
    ];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in deployment to avoid blocking users
    },
    credentials: true,
  })
);

// API Routes
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date() });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

// Production static file serving
const clientDistPath = path.resolve(__dirname, "../client/dist");
if (process.env.NODE_ENV === "production" || fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(clientDistPath, "index.html"));
  });
}

// Start Server
server.listen(PORT, async () => {
  console.log(`[Server] Running on port ${PORT}`);
  await connectDB();
});
