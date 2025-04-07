import React, { useState, useRef, useEffect } from "react";
import { MoreVertical, MessageCircle, User, Settings, LogOut } from "lucide-react";
import SignOut from "./SignOut";
import { useAtom } from "jotai";
import { userAtom } from "../atom";
import useUserPresence from "../hooks/useUserPresence"; // Import the presence hook

const NavBar = () => {
  const [user] = useAtom(userAtom);
  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef(null);
  const online = useUserPresence(user?.uid); // Get online status for current user

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
    return null;
  }

  return (
    <div className="bg-white border-b border-gray-200 py-3 px-4 md:px-6 flex justify-between items-center sticky top-0 z-20 shadow-sm">
      <div className="flex items-center space-x-2">
        <MessageCircle className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-bold text-gray-800 hidden sm:block">ChatSpace</h2>
      </div>
      
      <div className="flex items-center space-x-3">
        <div className="flex items-center text-sm text-gray-600 mr-2">
          {/* Dynamically render online status */}
          <span className={`w-2 h-2 rounded-full mr-2 ${online ? "bg-green-500" : "bg-gray-400"}`}></span>
          <span>{online ? "Online" : "Offline"}</span>
        </div>
        
        <div className="relative" ref={popupRef}>
          <button
            onClick={togglePopup}
            className="flex items-center space-x-2 focus:outline-none"
          >
            <div className="relative">
              <img
                src={user.photoURL || "https://via.placeholder.com/40"}
                alt="Profile"
                className="w-9 h-9 rounded-full object-cover border-2 border-blue-500"
              />
            </div>
            <span className="text-gray-800 font-medium hidden md:block truncate max-w-[120px]">
              {user.displayName}
            </span>
            <MoreVertical className="h-5 w-5 text-gray-500" />
          </button>
          
          {showPopup && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-10 overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <div className="flex items-center space-x-3">
                  <img
                    src={user.photoURL || "https://via.placeholder.com/40"}
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover mr-2"
                  />
                  <div>
                    <p className="font-semibold">{user.displayName}</p>
                    <p className="text-blue-100 text-sm truncate">{user.email}</p>
                  </div>
                </div>
              </div>
              
              <div className="py-2">
                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center text-gray-700">
                  <User className="mr-3 h-5 w-5 text-gray-500" />
                  <span>Profile</span>
                </button>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center text-gray-700">
                  <Settings className="mr-3 h-5 w-5 text-gray-500" />
                  <span>Settings</span>
                </button>
                <div className="border-t border-gray-200 mt-2 pt-2 px-4">
                  <SignOut />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavBar;
