import React, { useState } from "react";
import NavBar from "./NavBar";
import ConversationList from "./ConversationList";
import ChatRoom from "./ChatRoom";
import { MessageCircle } from "lucide-react";

const HomePage = () => {
  const [selectedChatId, setSelectedChatId] = useState(null);

  return (
    <div className="flex flex-col h-screen">
      <NavBar />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <ConversationList onSelectChat={setSelectedChatId} />
        </div>
        <div className="flex-grow flex flex-col bg-gray-50">
          {selectedChatId ? (
            <ChatRoom chatId={selectedChatId} />
          ) : (
            <div className="flex-grow flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-xl text-gray-600 mb-2">
                  Select a chat to start messaging
                </h3>
                <p className="text-gray-500">
                  Choose a conversation from the list or start a new chat
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