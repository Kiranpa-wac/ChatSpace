import React, { useState, useRef, useEffect } from "react";
import { db, auth } from "../../firebase";
import useOtherUserData from "../hooks/useOtheruserData";
import {
  collection,
  query,
  orderBy,
  doc,
  writeBatch,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { Send, Smile, PlusCircle, ArrowLeft } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import ChatMessage from "./ChatMessage";
import { MessageCircle } from "lucide-react";
import PresenceIndicator from "./PresenceIndicator";
import useChatConversations from "../hooks/useChatConversations";
import useUserPresence from "../hooks/useUserPresence";

const ChatRoom = ({ chatId, chats, setChats }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [sending, setSending] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const receiver = useOtherUserData(chatId);
  const inputRef = useRef(null);
  const online = useUserPresence(receiver?.uid);
  const { getParticipantName } = useChatConversations(auth.currentUser);

  // Focus on input field when chat changes
  useEffect(() => {
    setMessages([]);
    if (inputRef.current) {
      inputRef.current.focus();
    }
    const messageRef = collection(db, "chats", chatId, "messages");
    const q = query(messageRef, orderBy("createdAt"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [chatId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Detect scroll position to show/hide scroll button
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "" || sending) return;

    setShowEmojiPicker(false);
    setSending(true);
    const trimmedInput = input.trim();
    setInput("");

    const { uid, photoURL, displayName } = auth.currentUser;

    // Optimistically update the local chats array
    setChats((prevChats) => {
      const updatedChats = prevChats.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              lastMessage: {
                text: trimmedInput,
                createdAt: new Date(), // Temporary local timestamp
                senderId: uid,
              },
              unreadCount: {
                ...chat.unreadCount,
                [receiver?.id]: (chat.unreadCount?.[receiver?.id] || 0) + 1,
              },
            }
          : chat
      );
      return [...updatedChats].sort((a, b) => {
        const getTimeInMillis = (createdAt) =>
          createdAt?.toMillis
            ? createdAt.toMillis()
            : createdAt?.getTime() || 0;
        const timeA = getTimeInMillis(a.lastMessage?.createdAt);
        const timeB = getTimeInMillis(b.lastMessage?.createdAt);
        return timeB - timeA;
      });
    });

    try {
      const messageRef = collection(db, "chats", chatId, "messages");
      const chatRef = doc(db, "chats", chatId);
      const batch = writeBatch(db);

      const messageData = {
        senderId: uid,
        senderName: displayName,
        photoUrl: photoURL,
        text: trimmedInput,
        createdAt: serverTimestamp(),
      };

      // Add message to batch
      const newMessageRef = doc(messageRef);
      batch.set(newMessageRef, messageData);

      // Update lastMessage and unreadCount in batch
      batch.update(chatRef, {
        lastMessage: {
          text: trimmedInput,
          createdAt: serverTimestamp(),
          senderId: uid,
        },
        [`unreadCount.${receiver?.id}`]:
          (chats.find((c) => c.id === chatId)?.unreadCount?.[receiver?.id] ||
            0) + 1,
      });

      // Commit the batch
      await batch.commit();

      console.log(
        "Message sent and chat updated atomically for chatId:",
        chatId
      );
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const onEmojiClick = (emojiObject) => {
    setInput((prevInput) => prevInput + emojiObject.emoji);
    inputRef.current?.focus();
  };

  // Format date for timestamp header
  const formatMessageDate = (timestamp) => {
    if (!timestamp || !timestamp.toDate) return null;

    const date = timestamp.toDate();
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString(undefined, {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    if (!message.createdAt) return groups;

    const dateStr = formatMessageDate(message.createdAt);
    if (!groups[dateStr]) {
      groups[dateStr] = [];
    }
    groups[dateStr].push(message);
    return groups;
  }, {});
  console.log("receiver", receiver);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Chat Header */}
      <div className="flex items-center p-3 md:p-4 border-b border-gray-200 bg-white shadow-sm sticky top-0 z-10">
        <button
          className="md:hidden mr-2 text-gray-500 hover:text-gray-700"
          onClick={() => window.history.back()}
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center space-x-3">
          <div className="relative">
            {receiver?.photoURL ? (
              <img
                src={receiver.photoURL}
                alt={receiver.displayName}
                className="w-10 h-10 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full">
                {receiver?.displayName
                  ? receiver.displayName.charAt(0).toUpperCase()
                  : "?"}
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold text-gray-800">
              {receiver?.displayName || "Loading..."}
            </span>
            <div className="flex items-center">
              <PresenceIndicator uid={receiver?.uid} />
              <span className="text-xs text-gray-500 ml-1">
                {online ? "Online" : "Offline"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        className="flex-grow overflow-y-auto p-4 space-y-6 bg-gray-50"
        style={{ scrollBehavior: "smooth" }}
      >
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date}>
            <div className="flex justify-center mb-4">
              <span className="px-3 py-1 bg-gray-200 rounded-full text-xs font-medium text-gray-600">
                {date}
              </span>
            </div>

            <div className="space-y-1">
              {dateMessages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
            </div>
          </div>
        ))}

        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-blue-100 rounded-full">
                <MessageCircle className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Start a conversation
              </h3>
              <p className="text-gray-600 text-sm">
                Say hello to {receiver?.displayName || "your friend"}!
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="fixed bottom-24 right-6 p-2 bg-white rounded-full shadow-lg border border-gray-200 text-blue-500 hover:bg-blue-50 transition-all"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-20 right-4 z-10 shadow-xl rounded-lg overflow-hidden">
          <div className="bg-white p-2 rounded-t-lg border-b border-gray-200 flex justify-between">
            <span className="text-sm font-medium">Emoji</span>
            <button
              onClick={() => setShowEmojiPicker(false)}
              className="text-gray-500"
            >
              <X size={16} />
            </button>
          </div>
          <EmojiPicker onEmojiClick={onEmojiClick} width={300} height={350} />
        </div>
      )}

      {/* Message Input */}
      <form
        onSubmit={sendMessage}
        className="bg-white p-3 border-t border-gray-200 flex items-center shadow-sm sticky bottom-0 z-10"
      >
        <button
          type="button"
          className="p-2 rounded-full text-gray-500 hover:text-blue-500 hover:bg-blue-50 transition mr-1"
        >
          <PlusCircle className="h-5 w-5" />
        </button>
        <div className="flex-grow relative">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Message ${receiver?.displayName || "..."}...`}
            className="w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-700"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="mx-1 p-2 rounded-full text-gray-500 hover:text-yellow-500 hover:bg-yellow-50 transition"
        >
          <Smile className="h-5 w-5" />
        </button>
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className={`ml-1 p-2.5 rounded-full flex items-center justify-center transition ${
            input.trim() && !sending
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-gray-200 text-gray-400"
          }`}
        >
          {sending ? (
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </form>
    </div>
  );
};

export default ChatRoom;
