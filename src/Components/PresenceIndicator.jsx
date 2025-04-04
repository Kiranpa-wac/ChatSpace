import React, { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

const PresenceIndicator = ({ uid }) => {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (!uid) return;

    const userRef = doc(db, "users", uid);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        setIsOnline(doc.data().isOnline || false);
      }
    });

    return () => unsubscribe();
  }, [uid]);

  return (
    <div 
      className={`w-3 h-3 rounded-full border-2 border-white ${
        isOnline ? "bg-green-500" : "bg-gray-300"
      }`}
      title={isOnline ? "Online" : "Offline"}
    ></div>
  );
};

export default PresenceIndicator;