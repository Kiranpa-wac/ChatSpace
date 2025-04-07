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
import { useAtom } from "jotai";
import { userAtom } from "../atom";

const useNewChatModal = ({ onChatCreated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [currentUser] = useAtom(userAtom);

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
          unreadCount: {
            [currentUser.uid]: 0,
            [selectedUser.id]: 0,
          },
          readBy: [],
        };
        const chatRef = await addDoc(chatsRef, chatData);
        chatId = chatRef.id;

        const currentUserRef = doc(db, "users", currentUser.uid);
        const withUserName = selectedUser.displayName || "Unknown User";
        const updateData = {
          chatList: arrayUnion({
            chatId,
            withUserId: selectedUser.id,
            withUserName,
          }),
        };
        await updateDoc(currentUserRef, updateData);
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

  return {
    isOpen,
    setIsOpen,
    search,
    setSearch,
    results,
    loading,
    error,
    selectedUserId,
    handleSelectUser,
  };
};

export default useNewChatModal;