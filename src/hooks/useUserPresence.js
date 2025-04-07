import { useEffect, useState } from "react";
import { database } from "../../firebase"
import { onValue, ref } from "firebase/database";

 const useUserPresence = (uid) => {
  const [isOnline, setOnline] = useState(false);

  useEffect(() => {
    if (!uid) return;

    const statusRef = ref(database, `status/${uid}`);
    let timeoutId = null;

    const unsubscribe = onValue(statusRef, (snapshot) => {
      const data = snapshot.val();
      console.log("Presence data for", uid, data);

      if (data?.state === "online") {
        if (timeoutId) clearTimeout(timeoutId);
        setOnline(true);
      } else {
        timeoutId = setTimeout(() => setOnline(false), 2000);
      }
    });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      unsubscribe();
    };
  }, [uid]);

  return isOnline;
};
export default useUserPresence;