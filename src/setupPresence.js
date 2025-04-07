import { ref, onValue, set, onDisconnect } from "firebase/database";
import { database } from "../firebase";

export const setupPresence = (uid) => {
  if (!uid) return;
  const connectedRef = ref(database, ".info/connected");
  onValue(connectedRef, (snap) => {
    if (snap.val() === true) {
      const userStatusRef = ref(database, `/status/${uid}`);
      // Set user as online when connected
      set(userStatusRef, {
        state: "online",
        last_changed: Date.now(),
      });
      // Ensure that on disconnect the status is set to offline
      onDisconnect(userStatusRef).set({
        state: "offline",
        last_changed: Date.now(),
      });
    }
  });
};

export const goOffline = (uid) => {
  if (!uid) return;
  const userStatusRef = ref(database, `/status/${uid}`);
  set(userStatusRef, {
    state: "offline",
    last_changed: Date.now(),
  });
};