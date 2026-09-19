import React, { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import { useAuthContext } from "./AuthContext";

const SocketContext = createContext();

export const useSocketContext = () => {
  return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const { authUser } = useAuthContext();

  useEffect(() => {
    if (authUser) {
      const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (
        window.location.port === "5173" ? "http://localhost:5000" : "/"
      );

      const newSocket = io(SOCKET_URL, {
        query: {
          userId: authUser._id,
        },
        withCredentials: true,
      });

      setSocket(newSocket);

      // Listen for list of online users
      newSocket.on("getOnlineUsers", (users) => {
        setOnlineUsers(users);
      });

      // Listen for typing events
      newSocket.on("userTyping", ({ fromUserId }) => {
        setTypingUsers((prev) => new Set(prev).add(fromUserId));
      });

      newSocket.on("userStoppedTyping", ({ fromUserId }) => {
        setTypingUsers((prev) => {
          const updated = new Set(prev);
          updated.delete(fromUserId);
          return updated;
        });
      });

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [authUser]);

  const emitTyping = (toUserId) => {
    if (socket && toUserId) {
      socket.emit("typing", { toUserId });
    }
  };

  const emitStopTyping = (toUserId) => {
    if (socket && toUserId) {
      socket.emit("stopTyping", { toUserId });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        typingUsers,
        emitTyping,
        emitStopTyping,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
