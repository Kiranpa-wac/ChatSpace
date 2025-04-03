import React, { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../../firebase";

const useUserPresence = (uid) => {
  const [online, setOnline] = useState();

  useEffect(() => {
    if (!uid) return;
    const statusRef = ref(database, `status/${uid}`);
    const unsubscribe = onValue(statusRef, (snapshot) => {
      const status = snapshot.val();
      setOnline(status?.state === "online");
    });
    return () => unsubscribe();
  }, [uid]);
  return online;
};

export default useUserPresence;
