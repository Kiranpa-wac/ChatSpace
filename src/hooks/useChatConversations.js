// src/hooks/useChatConversations.js
import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, getDoc, doc } from "firebase/firestore";
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

      // For each chat document, determine the other user's ID and fetch their displayName
      for (const docSnapshot of snapshot.docs) {
        const chat = { id: docSnapshot.id, ...docSnapshot.data() };
        const otherUserId = chat.participants.find((id) => id !== currentUser.uid);

        if (!participantNames[otherUserId]) {
          try {
            const userDocRef = doc(db, "users", otherUserId);
            const userDoc = await getDoc(userDocRef);
            names[otherUserId] = userDoc.exists()
              ? userDoc.data().displayName
              : "Unknown User";
          } catch (error) {
            console.error("Error fetching user:", error);
            names[otherUserId] = "Unknown User";
          }
        }

        chatsData.push(chat);
      }

      setParticipantNames((prev) => ({ ...prev, ...names }));
      setChats(chatsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser?.uid]);

  const getParticipantName = (chat) => {
    const otherUserId = chat.participants.find((id) => id !== currentUser?.uid);
    return participantNames[otherUserId] || "Loading...";
  };

  return { chats, getParticipantName, loading };
};

export default useChatConversations;
