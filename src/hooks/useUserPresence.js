// src/hooks/useUserPresence.js
import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../../firebase";

const useUserPresence = (uid) => {
  const [online, setOnline] = useState(false);

  useEffect(() => {
    if (!uid) return;
    const statusRef = ref(database, `status/${uid}`);
    let timeoutId;
    const unsubscribe = onValue(statusRef, (snapshot) => {
      const data = snapshot.val();
      if (data?.state === "online") {
        // If we detect online, clear any pending offline timeout
        clearTimeout(timeoutId);
        setOnline(true);
      } else {
        // Wait 2 seconds before setting offline, to avoid flicker on refresh
        timeoutId = setTimeout(() => setOnline(false), 2000);
      }
    });
    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, [uid]);

  return online;
};

export default useUserPresence;
