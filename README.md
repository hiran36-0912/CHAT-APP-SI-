# 💬 PulseChat - Real-Time MERN Chat Application

A complete, production-ready real-time chat application built using the MERN stack (MongoDB, Express, React, Node.js) and Socket.io.

## 🚀 Features

- **Real-Time Messaging**: Instant 1-on-1 messaging powered by Socket.io.
- **Online / Offline Status**: Live indicator showing when contacts are connected.
- **Typing Indicators**: Real-time "typing..." notification when another user is writing a message.
- **Authentication**: Secure JWT-based authentication with bcrypt password hashing.
- **Message History**: Conversations persistently saved in MongoDB.
- **Modern Responsive Dark UI**: Styled with Tailwind CSS, Lucide icons, and Dicebear avatars.
- **Easy Deployment Ready**: Ready for deployment to platforms like Render, Railway, Vercel, or Heroku.

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Lucide React, Socket.io-client, React Hot Toast, Axios
- **Backend**: Node.js, Express.js, Socket.io, Mongoose
- **Database**: MongoDB (Local or MongoDB Atlas)

---

## 📁 Project Structure

```
├── .env                       # Environment variables (PORT, MONGODB_URI, JWT_SECRET)
├── package.json               # Root scripts (concurrent dev runner)
├── server/
│   ├── index.js               # Express & Socket.io server entry
│   ├── config/db.js           # MongoDB connection handler
│   ├── models/                # User & Message Mongoose models
│   ├── middleware/            # JWT authentication middleware
│   ├── routes/                # Auth, Users, and Messages REST routes
│   └── socket/socket.js       # Real-time WebSocket connection logic
└── client/
    ├── src/
    │   ├── context/           # AuthContext & SocketContext
    │   ├── components/        # Navbar, Sidebar, ChatContainer, etc.
    │   └── pages/             # Login, Register, Home
    └── vite.config.js
```

---

## ⚡ Quick Start

### 1. Configure MongoDB in `.env`
Ensure you have MongoDB running locally or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas):
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/chat_app
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### 2. Install Dependencies
Run from the root directory:
```bash
npm run install:all
```

### 3. Run Development Server
Run both client and server concurrently with one command:
```bash
npm run dev
```

The application will be running at:
- **Client (UI)**: [http://localhost:5173](http://localhost:5173)
- **Server (API & Sockets)**: [http://localhost:5000](http://localhost:5000)

---

## 📦 Production Build & Deployment

To build the client for production:
```bash
npm run build:client
```

When `NODE_ENV=production` is set in `.env`, the Express server automatically serves the built static frontend:
```bash
npm start
```
