import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const useAuthContext = () => {
  return useContext(AuthContext);
};

export const AuthContextProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(() => {
    const saved = localStorage.getItem("chat_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  // Check auth state from backend on initialization
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get("/auth/me");
        setAuthUser(res.data);
        localStorage.setItem("chat_user", JSON.stringify(res.data));
      } catch (error) {
        // Token invalid or expired
        localStorage.removeItem("chat_user");
        localStorage.removeItem("chat_token");
        setAuthUser(null);
      } finally {
        setLoading(false);
      }
    };

    if (localStorage.getItem("chat_token") || localStorage.getItem("chat_user")) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (usernameOrEmail, password) => {
    try {
      const res = await api.post("/auth/login", { usernameOrEmail, password });
      setAuthUser(res.data);
      localStorage.setItem("chat_user", JSON.stringify(res.data));
      if (res.data.token) {
        localStorage.setItem("chat_token", res.data.token);
      }
      toast.success(`Welcome back, ${res.data.fullName}!`);
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
      return false;
    }
  };

  const signup = async ({ fullName, username, email, password }) => {
    try {
      const res = await api.post("/auth/signup", {
        fullName,
        username,
        email,
        password,
      });
      setAuthUser(res.data);
      localStorage.setItem("chat_user", JSON.stringify(res.data));
      if (res.data.token) {
        localStorage.setItem("chat_token", res.data.token);
      }
      toast.success("Account created successfully!");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      localStorage.removeItem("chat_user");
      localStorage.removeItem("chat_token");
      setAuthUser(null);
      toast.success("Logged out successfully");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        authUser,
        loading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
