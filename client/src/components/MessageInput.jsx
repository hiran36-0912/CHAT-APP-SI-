import React, { useState, useRef } from "react";
import { Send } from "lucide-react";
import { useSocketContext } from "../context/SocketContext";

const MessageInput = ({ onSendMessage, selectedUserId, sending }) => {
  const [text, setText] = useState("");
  const { emitTyping, emitStopTyping } = useSocketContext();
  const typingTimeoutRef = useRef(null);

  const handleInputChange = (e) => {
    setText(e.target.value);

    // Emit typing indicator
    if (selectedUserId) {
      emitTyping(selectedUserId);

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        emitStopTyping(selectedUserId);
      }, 2000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    emitStopTyping(selectedUserId);

    const messageText = text;
    setText("");
    await onSendMessage(messageText);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 bg-slate-900/70 border-t border-slate-800 flex items-center gap-2"
    >
      <input
        type="text"
        placeholder="Type a message..."
        value={text}
        onChange={handleInputChange}
        className="flex-1 bg-slate-800 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
      />

      <button
        type="submit"
        disabled={!text.trim() || sending}
        className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white flex items-center justify-center transition-all shadow-md shadow-indigo-600/20 shrink-0"
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  );
};

export default MessageInput;
