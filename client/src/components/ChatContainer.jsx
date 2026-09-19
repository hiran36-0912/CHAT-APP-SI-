import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { useSocketContext } from "../context/SocketContext";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { MessageSquare, ShieldCheck, Zap } from "lucide-react";
import toast from "react-hot-toast";

const ChatContainer = ({ selectedUser, onClose, onMessageSent }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const { socket } = useSocketContext();

  // Fetch messages whenever the active conversation changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser?._id) return;
      setLoading(true);
      try {
        const res = await api.get(`/messages/${selectedUser._id}`);
        setMessages(res.data);
      } catch (error) {
        console.error("Failed to load messages:", error);
        toast.error("Could not load message history");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [selectedUser?._id]);

  // Real-time listener for incoming messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      // Only append if the message belongs to the active conversation
      if (
        selectedUser &&
        (newMessage.senderId === selectedUser._id || newMessage.receiverId === selectedUser._id)
      ) {
        setMessages((prev) => [...prev, newMessage]);
      }
      onMessageSent(); // Trigger sidebar refresh for latest message
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, selectedUser, onMessageSent]);

  const handleSendMessage = async (text) => {
    if (!selectedUser?._id) return;
    setSending(true);
    try {
      const res = await api.post(`/messages/send/${selectedUser._id}`, { text });
      setMessages((prev) => [...prev, res.data]);
      onMessageSent();
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (!selectedUser) {
    return (
      <div className="hidden md:flex flex-1 flex-col items-center justify-center p-8 bg-slate-950 text-center">
        <div className="w-20 h-20 rounded-3xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/5">
          <MessageSquare className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-slate-100 mb-2">Welcome to PulseChat</h2>
        <p className="text-sm text-slate-400 max-w-sm mb-6">
          Select a conversation from the sidebar to start instant real-time messaging with your contacts.
        </p>

        <div className="grid grid-cols-2 gap-4 max-w-md w-full text-left">
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <Zap className="w-5 h-5 text-amber-400 mb-2" />
            <h4 className="text-xs font-semibold text-slate-200">Real-Time Speed</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Instant delivery powered by Socket.io.</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <ShieldCheck className="w-5 h-5 text-emerald-400 mb-2" />
            <h4 className="text-xs font-semibold text-slate-200">Secure & Reliable</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">JWT authenticated & MongoDB persistent.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
      <ChatHeader selectedUser={selectedUser} onClose={onClose} />
      <MessageList messages={messages} selectedUser={selectedUser} loading={loading} />
      <MessageInput
        onSendMessage={handleSendMessage}
        selectedUserId={selectedUser._id}
        sending={sending}
      />
    </div>
  );
};

export default ChatContainer;
