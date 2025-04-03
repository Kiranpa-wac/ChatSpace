import React, { useState, useRef, useEffect } from "react";
import { db, auth, storage } from "../../firebase"; // Import Firebase Storage
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
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"; // Import Firebase Storage functions
import { Send, Smile, Paperclip } from "lucide-react"; // Added Paperclip icon
import EmojiPicker from "emoji-picker-react"; // Import emoji picker

const ChatRoom = ({ chatId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [file, setFile] = useState(null); // State for file attachment
  const fileInputRef = useRef(null); // Define fileInputRef

  const scrollToBottom = (node) => {
    if (node) {
      node.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    setMessages([]);
    const messageRef = collection(db, "chats", chatId, "messages");
    const q = query(messageRef, orderBy("createdAt"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [chatId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "" && !file) return;
    setInput("");
    setShowEmojiPicker(false);
    setFile(null); // Reset file state after sending

    const { uid, photoURL, displayName } = auth.currentUser;

    try {
      const messageRef = collection(db, "chats", chatId, "messages");
      const messageData = {
        senderId: uid,
        senderName: displayName,
        photoUrl: photoURL,
        createdAt: serverTimestamp(),
      };

      if (input.trim()) {
        messageData.text = input;
      }

      if (file) {
        const storageRef = ref(storage, `files/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            // Handle upload progress if needed
          },
          (error) => {
            console.error("Error uploading file:", error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            messageData.file = {
              url: downloadURL,
              name: file.name,
              type: file.type,
            };

            const docRef = await addDoc(messageRef, messageData);

            const chatRef = doc(db, "chats", chatId);
            await updateDoc(chatRef, {
              lastMessage: {
                text: input || file.name,
                createdAt: serverTimestamp(),
                senderId: uid,
              },
            });
          }
        );
      } else {
        await addDoc(messageRef, messageData);

        const chatRef = doc(db, "chats", chatId);
        await updateDoc(chatRef, {
          lastMessage: {
            text: input,
            createdAt: serverTimestamp(),
            senderId: uid,
          },
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const onEmojiClick = (emojiObject) => {
    setInput((prevInput) => prevInput + emojiObject.emoji);
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Messages Container */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={msg.id}
            className={`flex items-start ${
              msg.senderId === auth.currentUser.uid
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg ${
                msg.senderId === auth.currentUser.uid
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {msg.text && <p className="text-sm">{msg.text}</p>}
              {msg.file && (
                <div className="mt-2">
                  {msg.file.type.startsWith("image/") ? (
                    <img
                      src={msg.file.url}
                      alt={msg.file.name}
                      className="max-w-full h-auto"
                    />
                  ) : (
                    <a
                      href={msg.file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {msg.file.name}
                    </a>
                  )}
                </div>
              )}
              <span className="text-xs opacity-70 block mt-1 text-right">
                {msg.senderName}
              </span>
            </div>
            {index === messages.length - 1 && (
              <span ref={scrollToBottom}></span>
            )}
          </div>
        ))}
      </div>

      {showEmojiPicker && (
        <div className="absolute bottom-20 right-4">
          <EmojiPicker onEmojiClick={onEmojiClick} />
        </div>
      )}

      <form
        onSubmit={sendMessage}
        className="bg-gray-100 p-4 border-t border-gray-200 flex items-center relative"
      >
        <input
          type="file"
          onChange={handleFileChange}
          className="hidden"
          ref={fileInputRef}
          accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current.click()}
          className="ml-2 p-2 text-gray-600 hover:text-blue-500 transition"
        >
          <Paperclip className="h-5 w-5" />
        </button>
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
          disabled={!input && !file}
          className="ml-2 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 disabled:bg-gray-300 transition flex items-center"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
};

export default ChatRoom;
