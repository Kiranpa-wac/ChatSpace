// src/hooks/useNewChatModal.js
import { useState, useEffect } from "react";
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
  documentId,
} from "firebase/firestore";
import { db } from "../../firebase";

const useNewChatModal = (currentUser) => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Debounced search: trigger search after 500ms of inactivity
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleSelectUser = async (selectedUser, input) => {
    try {
      setSelectedUserId(selectedUser.id);
      if (!currentUser) return;

      const chatsRef = collection(db, "chats");
      const q = query(
        chatsRef,
        where("participants", "array-contains", currentUser.uid)
      );
      const snapshot = await getDocs(q);
      // Check if a chat already exists with the selected user
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
      return chatId;
    } catch (error) {
      console.error("Chat creation error:", error);
      setError("Failed to create chat. Please try again.");
      return null;
    } finally {
      setSelectedUserId(null);
    }
  };

  return {
    search,
    setSearch,
    results,
    loading,
    error,
    selectedUserId,
    handleSearch,
    handleSelectUser,
  };
};

export default useNewChatModal;
