// src/utils/typingStatus.js
import { ref, set, serverTimestamp, onDisconnect } from "firebase/database";
import { database } from "../firebase";

export const updateTypingStatus = (chatId, userId, isTyping) => {
  const typingRef = ref(database, `typingStatus/${chatId}/${userId}`);

  if (isTyping) {
    set(typingRef, {
      isTyping: true,
      lastChanged: serverTimestamp(),
    });
    // Ensure that if the client disconnects abruptly, we reset the status
    onDisconnect(typingRef).set({
      isTyping: false,
      lastChanged: serverTimestamp(),
    });
  } else {
    set(typingRef, {
      isTyping: false,
      lastChanged: serverTimestamp(),
    });
  }
};
