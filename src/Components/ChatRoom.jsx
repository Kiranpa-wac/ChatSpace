// src/Components/ChatRoom.js
import React, { useState, useEffect, useRef } from "react";
import { db, auth } from "../../firebase";
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
import { Send, Smile } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import useOtherUserData from "../hooks/useOtheruserData";

const ChatRoom = ({ chatId }) => {
  const dummy = useRef();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    setMessages([]);
    const messageRef = collection(db, "chats", chatId, "messages");
    const q = query(messageRef, orderBy("createdAt"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      dummy.current?.scrollIntoView({ behavior: "smooth" });
    });
    return () => unsubscribe();
  }, [chatId]);

  const otherUserData = useOtherUserData(chatId);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return;

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

    setInput("");
    setShowEmojiPicker(false);
  };

  const handleEmojiClick = (emojiObject) => {
    setInput((prevInput) => prevInput + emojiObject.emoji);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <div className="bg-gray-100 p-4 border-b border-gray-200 flex items-center">
        {otherUserData ? (
          <>
            <img
              src={
                otherUserData.photoURL ||
                "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png"
              }
              alt="Profile"
              className="w-10 h-10 rounded-full mr-3 object-cover"
            />
            <h2 className="text-xl font-semibold text-gray-800">
              {otherUserData.displayName}
            </h2>
          </>
        ) : (
          <h2 className="text-xl font-semibold text-gray-800">Chat Room</h2>
        )}
      </div>

      {/* Messages Container */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start ${
              msg.senderId === auth.currentUser.uid ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`
                max-w-[70%] p-3 rounded-lg 
                ${
                  msg.senderId === auth.currentUser.uid
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-800"
                }
              `}
            >
              <p className="text-sm">{msg.text}</p>
              <span className="text-xs opacity-70 block mt-1 text-right">
                {msg.senderName}
              </span>
            </div>
          </div>
        ))}
        <span ref={dummy}></span>
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-20 right-4">
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}

      {/* Message Input */}
      <form
        onSubmit={sendMessage}
        className="bg-gray-100 p-4 border-t border-gray-200 flex items-center"
      >
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="mr-2 text-gray-500 hover:text-blue-500 transition"
        >
          <Smile className="h-6 w-6" />
        </button>

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

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
