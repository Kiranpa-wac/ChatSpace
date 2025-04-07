import React, { useState, useEffect } from "react";
import NavBar from "./NavBar";
import ConversationList from "./ConversationList";
import ChatRoom from "./ChatRoom";
import { MessageCircle, Menu, X } from "lucide-react";
import { useAtom } from "jotai";
import { userAtom } from "../atom";
import useChatConversations from "../hooks/useChatConversations";

const HomePage = () => {
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [currentUser] = useAtom(userAtom);
  const { chats, setChats, getParticipantName, loading, markChatAsRead } = useChatConversations(currentUser);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Close sidebar on mobile when a chat is selected
  useEffect(() => {
    if (selectedChatId && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [selectedChatId]);

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <NavBar />
      
      <div className="flex-1 flex overflow-hidden relative">
        <button 
          onClick={toggleSidebar}
          className="md:hidden fixed bottom-4 left-4 z-20 p-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        
        {/* Sidebar */}
        <div 
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 fixed md:relative z-10 h-[calc(100vh-64px)] w-full max-w-xs bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out shadow-lg md:shadow-none`}
        >
          <ConversationList
            onSelectChat={(chatId) => {
              setSelectedChatId(chatId);
              if (window.innerWidth < 768) {
                setSidebarOpen(false);
              }
            }}
            chats={chats}
            setChats={setChats}
            getParticipantName={getParticipantName}
            loading={loading}
            markChatAsRead={markChatAsRead}
          />
        </div>
        
        <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "md:ml-0" : "ml-0"}`}>
          {selectedChatId ? (
            <ChatRoom chatId={selectedChatId} chats={chats} setChats={setChats} />
          ) : (
            <div className="flex-grow flex items-center justify-center p-4 bg-gray-50">
              <div className="text-center max-w-md p-8 bg-white rounded-xl shadow-sm">
                <MessageCircle className="mx-auto h-16 w-16 text-blue-500 mb-4" />
                <h3 className="text-xl text-gray-800 font-semibold mb-3">
                  Select a chat to start messaging
                </h3>
                <p className="text-gray-600">
                  Choose a conversation from the list or start a new chat using the button in the sidebar.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;