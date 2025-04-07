import React from "react";
import { auth } from "../../firebase";
import { LogOut } from "lucide-react";
import { useAtom } from "jotai";
import { userAtom } from "../atom";
import { goOffline } from "../setupPresence";
const SignOut = () => {
  const [user, setUser] = useAtom(userAtom);

  const handleSignOut = async () => {
    try {
      // Set the user's status to offline before signing out
      if (user?.uid) {
        goOffline(user.uid);
      }
      await auth.signOut();
      setUser(null);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      className="flex items-center justify-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md shadow-md transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50"
    >
      <LogOut className="mr-2 h-5 w-5" />
      Sign Out
    </button>
  );
};

export default SignOut;
