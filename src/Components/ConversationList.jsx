import React, { useState } from "react";
import { MessageCircle, Search, Plus, User, UsersRound } from "lucide-react";
import { auth } from "../../firebase";
import PresenceIndicator from "./PresenceIndicator";
import NewChatModal from "./NewChatModal";

const ConversationList = ({ onSelectChat, chats, setChats, getParticipantName, loading, markChatAsRead }) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const getOtherUserId = (chat) => {
    return chat.participants.find((id) => id !== auth.currentUser.uid);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin"></div>
            <MessageCircle className="absolute top-2 left-2 h-8 w-8 text-blue-500" />
          </div>
          <p className="text-gray-600 font-medium">Loading your conversations...</p>
        </div>
      </div>
    );
  }

  const sortedChats = (Array.isArray(chats) ? [...chats] : []).sort((a, b) => {
    // First sort by unread count (higher first)
    const unreadCountA = a.unreadCount?.[auth.currentUser.uid] || 0;
    const unreadCountB = b.unreadCount?.[auth.currentUser.uid] || 0;
    
    if (unreadCountA !== unreadCountB) {
      return unreadCountB - unreadCountA;
    }
    
    // Then sort by time (most recent first)
    const getTimeInMillis = (createdAt) => {
      if (!createdAt) return 0;
      return createdAt.toMillis ? createdAt.toMillis() : createdAt.getTime();
    };
    const timeA = getTimeInMillis(a.lastMessage?.createdAt);
    const timeB = getTimeInMillis(b.lastMessage?.createdAt);
    return timeB - timeA;
  });

  // Filter by search term if present
  const filteredChats = searchTerm.trim() 
    ? sortedChats.filter(chat => 
        getParticipantName(chat).toLowerCase().includes(searchTerm.toLowerCase())
      )
    : sortedChats;

  const handleChatSelect = (chatId) => {
    markChatAsRead(chatId);
    onSelectChat(chatId);
  };

  // Helper function to get Date object from either Timestamp or Date
  const getDateObject = (createdAt) => {
    if (!createdAt) return new Date(0);
    return createdAt.toDate ? createdAt.toDate() : createdAt;
  };

  // Format relative time for chat messages
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return "";
    
    const date = getDateObject(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-3 md:p-4 border-b border-gray-200 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <UsersRound className="mr-2 h-5 w-5 text-blue-500" />
            Messages
          </h2>
          <NewChatModal onChatCreated={onSelectChat} />
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full bg-gray-100 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {filteredChats.length > 0 ? (
        <div className="flex-1 overflow-y-auto">
          <ul className="divide-y divide-gray-100">
            {filteredChats.map((chat) => {
              const unreadCount = chat.unreadCount?.[auth.currentUser.uid] || 0;
              const hasUnread = unreadCount > 0;
              
              return (
                <li
                  key={chat.id}
                  onClick={() => handleChatSelect(chat.id)}
                  className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-all flex items-center ${
                    hasUnread ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-3 ${
                      hasUnread ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
                    }`}>
                      <span className="text-lg font-semibold">
                        {getParticipantName(chat)[0]?.toUpperCase() || "?"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`font-medium truncate ${hasUnread ? "text-blue-800" : "text-gray-800"}`}>
                        {getParticipantName(chat)}
                      </p>
                      {chat.lastMessage?.createdAt && (
                        <span className={`text-xs ${hasUnread ? "text-blue-600 font-medium" : "text-gray-500"}`}>
                          {formatMessageTime(chat.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                      <p className={`text-sm truncate ${
                        hasUnread ? "text-blue-600 font-medium" : "text-gray-500"
                      }`}>
                        {chat.lastMessage?.senderId === auth.currentUser.uid && (
                          <span className="mr-1 text-xs text-gray-400">You: </span>
                        )}
                        {chat.lastMessage?.text || "Start a conversation"}
                      </p>
                      
                      {hasUnread && (
                        <span className="bg-blue-500 text-white text-xs font-semibold h-5 min-w-5 px-1.5 rounded-full flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          {searchTerm ? (
            <>
              <Search className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-600 mb-2">No chats match "{searchTerm}"</p>
              <button 
                onClick={() => setSearchTerm("")}
                className="text-blue-500 hover:text-blue-700 text-sm font-medium"
              >
                Clear search
              </button>
            </>
          ) : (
            <>
              <MessageCircle className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-600 mb-6">No conversations yet</p>
              <button
                onClick={() => document.querySelector('[aria-label="New Chat"]')?.click()}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition flex items-center"
              >
                <Plus className="mr-2 h-4 w-4" />
                Start a conversation
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ConversationList;