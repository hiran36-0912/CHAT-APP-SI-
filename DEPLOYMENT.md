# 🚀 Deployment Guide - PulseChat MERN Application

This guide covers how to deploy the application for free to cloud platforms like **Render**, **Railway**, or **Docker** in just a few minutes.

---

## 🗄️ Step 1: Set Up MongoDB Atlas (Free Cloud Database)

Since local MongoDB (`127.0.0.1:27017`) is only on your computer, production needs a cloud MongoDB database:

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and sign in or sign up.
2. Click **Create a Deployment** and select the **M0 Free** cluster.
3. In **Database Access**, create a user with a username and password (e.g. `admin` and a strong password).
4. In **Network Access**, click **Add IP Address** and select **Allow Access from Anywhere** (`0.0.0.0/0`).
5. Click **Connect** -> **Drivers** -> Copy the connection string:
   ```text
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/chat_app?retryWrites=true&w=majority
   ```
   *(Replace `<username>` and `<password>` with your database user credentials)*.

---

## 🌐 Step 2: Deploy to Render (Recommended - Free Tier)

Render supports WebSockets and full-stack Node.js applications natively.

1. Push your repository to **GitHub**.
2. Go to [render.com](https://render.com/) and click **New +** -> **Web Service**.
3. Select your GitHub repository.
4. Configure the settings:
   - **Name**: `pulsechat` (or your choice)
   - **Runtime**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
5. In **Environment Variables**, add:
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = *(your MongoDB Atlas connection string from Step 1)*
   - `JWT_SECRET` = *(any random secure 32+ character string)*
6. Click **Deploy Web Service**!

Render will automatically:
- Install root, server, and client dependencies.
- Build the optimized Vite React frontend.
- Start the Express + Socket.io server which serves both the API and the React frontend on one URL!

---

## 🚂 Step 3: Deploy to Railway (Alternative)

1. Go to [railway.app](https://railway.app) and click **New Project** -> **Deploy from GitHub repo**.
2. Add your environment variables in the **Variables** tab:
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = *(your MongoDB Atlas connection string)*
   - `JWT_SECRET` = *(your secret key)*
3. Railway automatically detects `npm run build` and `npm start` from `package.json` and provisions a public domain.

---

## 🐳 Step 4: Docker Container Deployment

You can build and run this container anywhere Docker is installed:

```bash
# Build the production image
docker build -t pulsechat .

# Run container with your MongoDB Atlas URI
docker run -d -p 5000:5000 \
  -e MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/chat_app" \
  -e JWT_SECRET="your_secret_key" \
  pulsechat
```

Access the app at `http://localhost:5000`.

---

## 🔑 Environment Variables Checklist

| Variable | Description | Example |
| :--- | :--- | :--- |
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Port for the backend server | `5000` (or injected by host) |
| `MONGODB_URI` | MongoDB Connection String | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `your_super_secret_jwt_key_here` |
| `CLIENT_URL` | (Optional) Frontend URL if deployed separately | `https://your-frontend.vercel.app` |
