import React, { useState, useRef, useEffect } from "react";
import { useAtom } from "jotai";
import { userAtom } from "../atom";
import { MoreVertical, MessageCircle } from "lucide-react";
import SignOut from "./SignOut";

const NavBar = () => {
  const [user] = useAtom(userAtom);
  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef(null);

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowPopup(false);
      }
    };

    if (showPopup) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPopup]);

  if (!user) {
    return null; // User should be available since Navbar is within ProtectedRoute
  }

  return (
    <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center relative">
      <div className="flex items-center">
        <MessageCircle className="mr-2 h-6 w-6 text-blue-500" />
        <h2 className="text-2xl font-bold text-gray-800">ChatSpace</h2>
      </div>
      <button
        onClick={togglePopup}
        className="text-gray-600 hover:text-gray-800 focus:outline-none"
      >
        <MoreVertical className="h-6 w-6" />
      </button>
      {showPopup && (
        <div
          ref={popupRef}
          className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-10"
        >
          <div className="p-4 flex items-center space-x-3">
            <img
              src={
                user.photoURL ||
                "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png"
              }
              alt="Profile"
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <p className="text-gray-800 font-semibold">{user.displayName}</p>
              <p className="text-gray-500 text-sm">{user.email}</p>
            </div>
          </div>
          <div className="border-t border-gray-200 p-2">
            <SignOut />
          </div>
        </div>
      )}
    </div>
  );
};

export default NavBar ;