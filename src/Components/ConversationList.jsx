import React from "react";
import { MessageCircle, UserPlus } from "lucide-react";
import { useAtom } from "jotai";
import { userAtom } from "../atom";
import useChatConversations from "../hooks/useChatConversations";
import PresenceIndicator from "./PresenceIndicator";
import NewChatModal from "./NewChatModal";

const ConversationList = ({ onSelectChat }) => {
  const [currentUser] = useAtom(userAtom);
  const { chats, getParticipantName, loading } = useChatConversations(currentUser);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full p-4">
        <div className="animate-pulse text-gray-500 flex items-center">
          <MessageCircle className="mr-2 h-6 w-6" />
          <p>Loading Chats...</p>
        </div>
      </div>
    );
  }
  const getOtherUserId = (chat, currentUserId) => {
    return chat.participants.find((id) => id !== currentUserId)
  }

  return (
    <div className="bg-white h-full border-r border-gray-200">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <MessageCircle className="mr-2 h-6 w-6" />
          Chats
        </h2>
        <NewChatModal onChatCreated={onSelectChat} />
      </div>

      {chats.length > 0 ? (
        <ul className="divide-y divide-gray-200">
          {chats.map((chat) => (
            <li
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition duration-300 ease-in-out flex items-center"
            >
              <div className="relative w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 font-semibold">
                  {getParticipantName(chat)[0].toUpperCase()}
                </span>
                <div className="absolute bottom-0 right-0">
                  <PresenceIndicator uid={getOtherUserId(chat, currentUser.uid)} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-800 font-medium truncate">
                  {getParticipantName(chat)}
                </p>
                
              </div>
              {chat.lastMessage && (
                <span className="ml-2 text-xs text-gray-400">
                  {new Date(
                    chat.lastMessage?.createdAt?.toDate()
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <MessageCircle className="h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">No chats yet</p>
        </div>
      )}
    </div>
  );
};

export default ConversationList;
