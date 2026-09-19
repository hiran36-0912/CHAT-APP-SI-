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
    if (authUser && authUser._id) {
      // Automatically detect server address in dev vs production
      const isDevFrontend =
        window.location.port === "5173" || window.location.port === "3000";

      const SOCKET_URL =
        import.meta.env.VITE_SOCKET_URL ||
        (isDevFrontend
          ? `http://${window.location.hostname}:5000`
          : window.location.origin);

      const newSocket = io(SOCKET_URL, {
        query: {
          userId: authUser._id,
        },
        withCredentials: true,
        transports: ["websocket", "polling"],
      });

      setSocket(newSocket);

      // Listen for list of online users
      newSocket.on("getOnlineUsers", (users) => {
        setOnlineUsers(users || []);
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
