// src/hooks/useTypingStatus.js
import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../../firebase";

const useTypingStatus = (chatId, userId) => {
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!chatId || !userId) return;
    const typingRef = ref(database, `typingStatus/${chatId}/${userId}`);
    const unsubscribe = onValue(typingRef, (snapshot) => {
      const data = snapshot.val();
      setIsTyping(data?.isTyping || false);
    });
    return () => unsubscribe();
  }, [chatId, userId]);

  return isTyping;
};

export default useTypingStatus;
