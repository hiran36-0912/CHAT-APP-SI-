import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [messagesRefreshTrigger, setMessagesRefreshTrigger] = useState(0);

  const handleMessageSent = () => {
    // Increment trigger to refresh sidebar's last message snippet
    setMessagesRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-950">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        {/* On mobile: show sidebar only when no user is selected. On md+: always show sidebar */}
        <div className={`${selectedUser ? "hidden md:flex" : "flex"} w-full md:w-auto h-full`}>
          <Sidebar
            selectedUser={selectedUser}
            onSelectUser={setSelectedUser}
            messagesRefreshTrigger={messagesRefreshTrigger}
          />
        </div>

        {/* On mobile: show chat container only when a user is selected. On md+: always show chat container */}
        <div className={`${!selectedUser ? "hidden md:flex" : "flex"} flex-1 h-full`}>
          <ChatContainer
            selectedUser={selectedUser}
            onClose={() => setSelectedUser(null)}
            onMessageSent={handleMessageSent}
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
