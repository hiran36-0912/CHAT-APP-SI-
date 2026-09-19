import React from "react";
import { useSocketContext } from "../context/SocketContext";
import { ArrowLeft, MoreVertical } from "lucide-react";

const ChatHeader = ({ selectedUser, onClose }) => {
  const { onlineUsers, typingUsers } = useSocketContext();
  const isOnline = onlineUsers.includes(selectedUser?._id);
  const isTyping = typingUsers.has(selectedUser?._id);

  if (!selectedUser) return null;

  return (
    <div className="h-16 px-6 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        {/* Back button for mobile */}
        <button
          onClick={onClose}
          className="md:hidden p-1.5 -ml-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="relative">
          <img
            src={
              selectedUser.profilePic ||
              `https://api.dicebear.com/7.x/bottts/svg?seed=${selectedUser.username}`
            }
            alt={selectedUser.fullName}
            className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 object-cover"
          />
          <span
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900 ${
              isOnline ? "bg-emerald-500" : "bg-slate-500"
            }`}
          />
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-100">{selectedUser.fullName}</h2>
          <div className="text-xs flex items-center gap-1.5">
            {isTyping ? (
              <span className="text-indigo-400 font-medium animate-pulse">typing...</span>
            ) : isOnline ? (
              <span className="text-emerald-400 font-medium">Online</span>
            ) : (
              <span className="text-slate-400">Offline</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
