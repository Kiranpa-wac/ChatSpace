import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, getDoc, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../../firebase";

const useChatConversations = (currentUser) => {
  const [chats, setChats] = useState([]);
  const [participantNames, setParticipantNames] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const chatsData = [];
      const names = {};

      for (const docSnapshot of snapshot.docs) {
        const chat = { id: docSnapshot.id, ...docSnapshot.data() };
        chatsData.push(chat);
        const otherUserId = chat.participants.find((id) => id !== currentUser.uid);
        if (otherUserId && !participantNames[otherUserId]) {
          try {
            const userDocRef = doc(db, "users", otherUserId);
            const userDoc = await getDoc(userDocRef);
            names[otherUserId] = userDoc.exists() ? userDoc.data().displayName : "Unknown User";
          } catch (error) {
            console.error("Error fetching user:", error);
            names[otherUserId] = "Unknown User";
          }
        }
      }
      setParticipantNames((prev) => ({ ...prev, ...names }));
      setChats(chatsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser?.uid]);

  // Function to extract other user's display name
  const getParticipantName = (chat) => {
    const otherUserId = chat.participants.find((id) => id !== currentUser?.uid);
    return participantNames[otherUserId] || "Loading...";
  };

  // Function to mark a chat as read by resetting the unread count for currentUser
  const markChatAsRead = async (chatId) => {
    try {
      const chatRef = doc(db, "chats", chatId);
      await updateDoc(chatRef, {
        [`unreadCount.${currentUser.uid}`]: 0,
      });
    } catch (error) {
      console.error("Error marking chat as read:", error);
    }
  };

  return { chats, setChats, getParticipantName, loading, markChatAsRead };
};

export default useChatConversations;
