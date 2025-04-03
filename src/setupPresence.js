import {
  ref,
  onValue,
  set,
  serverTimestamp,
  onDisconnect,
} from "firebase/database";
import { database, auth } from "../firebase";

export const setupPresence = () => {
  const user = auth.currentUser;
  if (!user) return;

  const connectedRef = ref(database, ".info/connected");
  onValue(connectedRef, (snap) => {
    if (snap.val() === true) {
      // When connected, update the user's status to "online"
      const statusRef = ref(database, `status/${user.uid}`);
      set(statusRef, {
        state: "online",
        last_changed: serverTimestamp(),
      });
      // When the connection is lost, update the status to "offline"
      onDisconnect(statusRef).set({
        state: "offline",
        last_changed: serverTimestamp(),
      });
    }
  });
};
