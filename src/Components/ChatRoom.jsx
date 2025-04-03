import React, { useState, useRef, useEffect } from "react";
import { db, auth } from "../../firebase"; // Adjust based on your setup
import {
  collection,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { Send, Smile } from "lucide-react"; // Added Smile icon
import EmojiPicker from 'emoji-picker-react'; // Import emoji picker

const ChatRoom = ({ chatId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // State for emoji picker visibility

  // Callback function to scroll to the referenced element
  const scrollToBottom = (node) => {
    if (node) {
      node.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Fetch messages when chatId changes
  useEffect(() => {
    setMessages([]); // Clear previous messages
    const messageRef = collection(db, "chats", chatId, "messages");
    const q = query(messageRef, orderBy("createdAt"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [chatId]);

  // Send a new message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return;
    setInput("");
    setShowEmojiPicker(false); // Hide emoji picker after sending

    const { uid, photoURL, displayName } = auth.currentUser;

    try {
      const messageRef = collection(db, "chats", chatId, "messages");
      await addDoc(messageRef, {
        text: input,
        senderId: uid,
        senderName: displayName,
        photoUrl: photoURL,
        createdAt: serverTimestamp(),
      });

      const chatRef = doc(db, "chats", chatId);
      await updateDoc(chatRef, {
        lastMessage: {
          text: input,
          createdAt: serverTimestamp(),
          senderId: uid,
        },
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Handle emoji selection
  const onEmojiClick = (emojiObject) => {
    setInput((prevInput) => prevInput + emojiObject.emoji);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Messages Container */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={msg.id}
            className={`flex items-start ${
              msg.senderId === auth.currentUser.uid ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg ${
                msg.senderId === auth.currentUser.uid
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              <p className="text-sm">{msg.text}</p>
              <span className="text-xs opacity-70 block mt-1 text-right">
                {msg.senderName}
              </span>
            </div>
            {index === messages.length - 1 && <span ref={scrollToBottom}></span>}
          </div>
        ))}
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-20 right-4">
          <EmojiPicker onEmojiClick={onEmojiClick} />
        </div>
      )}

      {/* Message Input */}
      <form
        onSubmit={sendMessage}
        className="bg-gray-100 p-4 border-t border-gray-200 flex items-center relative"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="ml-2 p-2 text-gray-600 hover:text-blue-500 transition"
        >
          <Smile className="h-5 w-5" />
        </button>
        <button
          type="submit"
          disabled={!input}
          className="ml-2 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 disabled:bg-gray-300 transition flex items-center"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
};

export default ChatRoom;