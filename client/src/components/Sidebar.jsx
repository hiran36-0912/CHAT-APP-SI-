import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { useSocketContext } from "../context/SocketContext";
import { Search, Users, Circle } from "lucide-react";

const Sidebar = ({ selectedUser, onSelectUser, messagesRefreshTrigger }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { onlineUsers } = useSocketContext();

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (error) {
      console.error("Error loading contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [messagesRefreshTrigger]);

  const filteredUsers = users.filter(
    (u) =>
      u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      u.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="w-full md:w-80 lg:w-96 border-r border-slate-800 bg-slate-900/50 flex flex-col h-full shrink-0">
      {/* Sidebar Header & Search */}
      <div className="p-4 border-b border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
            <Users className="w-4 h-4 text-indigo-400" />
            <span>Conversations</span>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60 font-mono">
            {users.length}
          </span>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700/60 rounded-xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/30 p-2 space-y-1">
        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 bg-slate-800 rounded-full" />
                <div className="space-y-1.5 flex-1">
                  <div className="w-24 h-3.5 bg-slate-800 rounded" />
                  <div className="w-36 h-2.5 bg-slate-800/60 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-10 px-4 text-slate-400 text-xs">
            {search ? "No conversations match your search." : "No other users registered yet."}
          </div>
        ) : (
          filteredUsers.map((user) => {
            const isOnline = onlineUsers.includes(user._id);
            const isSelected = selectedUser?._id === user._id;

            return (
              <button
                key={user._id}
                onClick={() => onSelectUser(user)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-150 ${
                  isSelected
                    ? "bg-indigo-600/15 border border-indigo-500/30 text-white"
                    : "hover:bg-slate-800/60 text-slate-300 border border-transparent"
                }`}
              >
                {/* User Avatar with Online Indicator */}
                <div className="relative shrink-0">
                  <img
                    src={user.profilePic || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                    alt={user.fullName}
                    className="w-11 h-11 rounded-full bg-slate-800 border border-slate-700 object-cover"
                  />
                  <span
                    className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                      isOnline ? "bg-emerald-500" : "bg-slate-500"
                    }`}
                    title={isOnline ? "Online" : "Offline"}
                  />
                </div>

                {/* User Info & Preview */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className="text-sm font-semibold text-slate-100 truncate">
                      {user.fullName}
                    </h3>
                    {user.lastMessageTime && (
                      <span className="text-[10px] text-slate-500 shrink-0">
                        {new Date(user.lastMessageTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 truncate">
                    {user.lastMessage || `@${user.username}`}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
