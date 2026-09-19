import React from "react";
import { useAuthContext } from "../context/AuthContext";
import { MessageSquare, LogOut } from "lucide-react";

const Navbar = () => {
  const { authUser, logout } = useAuthContext();

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
          <MessageSquare className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            PulseChat
          </h1>
          <p className="text-xs text-slate-400 font-medium">Real-Time Messaging</p>
        </div>
      </div>

      {authUser && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-slate-800/60 py-1.5 px-3 rounded-full border border-slate-700/50">
            <img
              src={authUser.profilePic || `https://api.dicebear.com/7.x/bottts/svg?seed=${authUser.username}`}
              alt={authUser.username}
              className="w-7 h-7 rounded-full bg-slate-700 border border-slate-600 object-cover"
            />
            <div className="hidden sm:block text-left">
              <span className="text-xs font-semibold text-slate-200 block leading-tight">
                {authUser.fullName}
              </span>
              <span className="text-[10px] text-slate-400 block leading-tight">
                @{authUser.username}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            title="Log out"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
