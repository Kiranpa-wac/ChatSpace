import React, { useState, useEffect } from "react";
import { 
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  arrayUnion,
  documentId
} from "firebase/firestore";
import { db } from "../../firebase";
import { useAtom } from "jotai";
import { userAtom } from "../atom";
import { 
  Search, 
  X, 
  MessageSquarePlus, 
  Loader2 
} from "lucide-react";

const NewChatModal = ({ onChatCreated }) => {
  // Internal modal state
  const [isOpen, setIsOpen] = useState(false);

  // Modal fields & state
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [currentUser] = useAtom(userAtom);

  // Debounced search: Trigger search 500ms after typing stops.
  useEffect(() => {
    const handler = setTimeout(() => {
      const searchTerm = search.trim().toLowerCase();
      if (searchTerm.length >= 2) {
        handleSearch(searchTerm);
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [search]);

  const handleSearch = async (searchTerm) => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);
    try {
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("searchName", ">=", searchTerm),
        where("searchName", "<=", searchTerm + "\uf8ff"),
        where(documentId(), "!=", currentUser.uid)
      );

      const snapshot = await getDocs(q);
      const filtered = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setResults(filtered);
    } catch (error) {
      console.error("Search error:", error);
      setError("Failed to search. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = async (selectedUser) => {
    try {
      setSelectedUserId(selectedUser.id);
      if (!currentUser) return;

      const chatsRef = collection(db, "chats");
      const q = query(
        chatsRef,
        where("participants", "array-contains", currentUser.uid)
      );
      const snapshot = await getDocs(q);
      let existingChat = snapshot.docs.find((doc) =>
        doc.data().participants.includes(selectedUser.id)
      );
      let chatId;
      if (existingChat) {
        chatId = existingChat.id;
      } else {
        const chatData = {
          participants: [currentUser.uid, selectedUser.id],
          createdAt: serverTimestamp(),
          lastMessage: {
            text: "", 
            createdAt: serverTimestamp(),
            senderId: currentUser.uid,
          },
        };
        const chatRef = await addDoc(chatsRef, chatData);
        chatId = chatRef.id;
        // Update current user's chatList
        const currentUserRef = doc(db, "users", currentUser.uid);
        await updateDoc(currentUserRef, {
          chatList: arrayUnion({
            chatId,
            withUserId: selectedUser.id,
            withUserName: selectedUser.displayName,
          }),
        });
      }
      onChatCreated(chatId);
      setIsOpen(false);
    } catch (error) {
      console.error("Chat creation error:", error);
      setError("Failed to create chat. Please try again.");
    } finally {
      setSelectedUserId(null);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300"
      >
        Start a New Chat
      </button>
    );
  }

  // When open, render the modal overlay.
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md transform transition-all">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            <MessageSquarePlus className="mr-2 text-blue-500" size={24} />
            Start a New Conversation
          </h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700 focus:outline-none p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search for users..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          {search && (
            <button 
              onClick={() => setSearch("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="max-h-72 overflow-y-auto rounded-lg border border-gray-200">
          {loading ? (
            <div className="p-6 flex justify-center items-center text-gray-500">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Searching...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {search.trim().length >= 2
                ? "No users found"
                : "Start typing to search for users"}
            </div>
          ) : (
            results.map((user) => (
              <div
                key={user.id}
                onClick={() => handleSelectUser(user)}
                className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors ${
                  selectedUserId === user.id ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex-shrink-0 mr-3">
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName} 
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-medium">
                      {user.displayName && user.displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {user.displayName}
                  </div>
                  {user.email && (
                    <div className="text-sm text-gray-500 truncate">
                      {user.email}
                    </div>
                  )}
                </div>
                {selectedUserId === user.id ? (
                  <Loader2 className="ml-2 h-5 w-5 text-blue-500 animate-spin" />
                ) : (
                  <div className="ml-2 p-1 rounded-full bg-gray-100 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MessageSquarePlus size={16} />
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewChatModal;
