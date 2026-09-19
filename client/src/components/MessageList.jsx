import React, { useEffect, useRef } from "react";
import { useAuthContext } from "../context/AuthContext";
import { MessageSquareDashed } from "lucide-react";

const MessageList = ({ messages, selectedUser, loading }) => {
  const { authUser } = useAuthContext();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
          <MessageSquareDashed className="w-8 h-8" />
        </div>
        <h3 className="text-base font-semibold text-slate-200">No messages yet</h3>
        <p className="text-xs text-slate-400 max-w-xs mt-1">
          Send a message below to start your conversation with {selectedUser.fullName}!
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
      {messages.map((msg) => {
        const isFromMe = msg.senderId === authUser._id;
        const timeFormatted = new Date(msg.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <div
            key={msg._id}
            className={`flex items-end gap-2.5 ${isFromMe ? "justify-end" : "justify-start"}`}
          >
            {!isFromMe && (
              <img
                src={
                  selectedUser.profilePic ||
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${selectedUser.username}`
                }
                alt={selectedUser.fullName}
                className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 object-cover shrink-0 mb-1"
              />
            )}

            <div
              className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                isFromMe
                  ? "bg-indigo-600 text-white rounded-br-xs"
                  : "bg-slate-800 text-slate-100 rounded-bl-xs border border-slate-700/60"
              }`}
            >
              <p className="break-words leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              <div
                className={`text-[10px] mt-1 text-right select-none ${
                  isFromMe ? "text-indigo-200/75" : "text-slate-400"
                }`}
              >
                {timeFormatted}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
