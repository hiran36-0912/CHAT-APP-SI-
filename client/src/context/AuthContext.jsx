import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const useAuthContext = () => {
  return useContext(AuthContext);
};

export const AuthContextProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(() => {
    try {
      const saved = localStorage.getItem("chat_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Check auth state on application startup
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("chat_token");
        if (!token && !localStorage.getItem("chat_user")) {
          setAuthUser(null);
          setLoading(false);
          return;
        }

        const res = await api.get("/auth/me");
        setAuthUser(res.data);
        localStorage.setItem("chat_user", JSON.stringify(res.data));
      } catch {
        // Token invalid, expired, or backend restarted
        localStorage.removeItem("chat_user");
        localStorage.removeItem("chat_token");
        setAuthUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (usernameOrEmail, password) => {
    try {
      const res = await api.post("/auth/login", {
        usernameOrEmail: usernameOrEmail.trim(),
        password,
      });

      setAuthUser(res.data);
      localStorage.setItem("chat_user", JSON.stringify(res.data));
      if (res.data.token) {
        localStorage.setItem("chat_token", res.data.token);
      }

      toast.success(`Welcome back, ${res.data.fullName}!`);
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Login failed. Please check your credentials and try again.";
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const signup = async ({ fullName, username, email, password }) => {
    try {
      const res = await api.post("/auth/signup", {
        fullName: fullName.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        password,
      });

      setAuthUser(res.data);
      localStorage.setItem("chat_user", JSON.stringify(res.data));
      if (res.data.token) {
        localStorage.setItem("chat_token", res.data.token);
      }

      toast.success("Account created successfully!");
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Registration failed. Please review your details and try again.";
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.warn("Logout request completed with warning", error);
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
