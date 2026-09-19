import axios from "axios";

// Automatically use proxy in dev or current origin in production
const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
});

// Interceptor to inject Authorization header if token exists in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("chat_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
