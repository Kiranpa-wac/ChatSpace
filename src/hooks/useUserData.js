import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db, auth } from "../../firebase";


export default function useUserData() {
    const [userData, setUserData] = useState(null);
  
    useEffect(() => {
      if (!auth.currentUser) return;
  
      const unsubscribe = onSnapshot(doc(db, 'users', auth.currentUser.uid), 
        (doc) => {
          if (doc.exists()) {
            setUserData(doc.data());
          }
        },
        (error) => {
          console.error("Error fetching user data:", error);
        }
      );
  
      return () => unsubscribe();
    }, []);
  
    return userData;
  }
  