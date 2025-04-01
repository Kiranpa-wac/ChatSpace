import React, { useState } from "react";
import SignOut from "./SignOut";
import ConversationList from "./ConversationList";
import ChatRoom from "./ChatRoom";
import { MessageCircle } from "lucide-react";

const HomePage = () => {
  const [selectedChatId, setSelectedChatId] = useState(null);

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-80 bg-white border-r border-gray-200">
        <header className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center">
            <MessageCircle className="mr-2 h-6 w-6 text-blue-500" />
            <h2 className="text-2xl font-bold text-gray-800">ChatSpace</h2>
          </div>
          <SignOut />
        </header>
        <ConversationList onSelectChat={setSelectedChatId} />
      </div>

      {/* Main Chat Area */}
      <div className="flex-grow flex flex-col">
        {selectedChatId ? (
          <ChatRoom chatId={selectedChatId} />
        ) : (
          <div className="flex-grow flex items-center justify-center bg-gray-50">
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
  );
};

export default HomePage;
