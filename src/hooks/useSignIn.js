import { useState } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "../../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAtom } from "jotai";
import { userAtom } from "../atom";
import { useNavigate } from "react-router-dom";
import { setupPresence } from "../setupPresence";

const useSignIn = () => {
  const [error, setError] = useState(null);
  const [user, setUser] = useAtom(userAtom);
  const navigate = useNavigate();

  const signIn = async () => {
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const currentUser = result.user;

      // Get reference to user document in Firestore
      const userDocRef = doc(db, "users", currentUser.uid);
      const docSnap = await getDoc(userDocRef);
      setupPresence(currentUser.uid)
      // If the document does not exist, create it
      if (!docSnap.exists()) {
        await setDoc(userDocRef, {
          displayName: currentUser.displayName,
          searchName: currentUser.displayName.toLowerCase(),
          email: currentUser.email,
          photoUrl: currentUser.photoURL,
          chatList: [],
        });
      }

      // Update global user state
      setUser({
        uid: currentUser.uid,
        displayName: currentUser.displayName,
        email: currentUser.email,
      });

      navigate("/home");
    } catch (err) {
      console.error(err);
      setError(err);
    }
  };

  return { signIn, error };
};

export default useSignIn;
