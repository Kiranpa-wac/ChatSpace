// src/hooks/useOtherUserData.js
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../firebase";

const useOtherUserData = (chatId) => {
  const [otherUserData, setOtherUserData] = useState(null);

  useEffect(() => {
    const fetchOtherUser = async () => {
      try {
        const chatRef = doc(db, "chats", chatId);
        const chatSnap = await getDoc(chatRef);
        if (chatSnap.exists()) {
          const chatData = chatSnap.data();
          // Determine the other participant (not the current user)
          const currentUserId = auth.currentUser.uid;
          const otherUserId = chatData.participants.find(
            (id) => id !== currentUserId 
          );
          if (otherUserId) {
            // Fetch the other user's document
            const otherUserRef = doc(db, "users", otherUserId);
            const otherUserSnap = await getDoc(otherUserRef);
            if (otherUserSnap.exists()) {
              setOtherUserData(otherUserSnap.data());
            }
          }
        }
      } catch (error) {
        console.error("Error fetching other user data:", error);
      }
    };

    if (chatId) {
      fetchOtherUser();
    }
  }, [chatId]);

  return otherUserData;
};

export default useOtherUserData;
