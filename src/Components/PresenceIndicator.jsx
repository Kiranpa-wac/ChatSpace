import React from "react";
import useUserPresence from "../hooks/useUserPresence";

const PresenceIndicator = ({ uid }) => {
  const online = useUserPresence(uid);
  
  return (
    <span
      className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
        online ? "bg-green-500" : "bg-gray-100"
      }`}
      title={online ? "Online" : "Offline"}
    >
      {/* Pulse animation for online users */}
      {online && (
        <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping"></span>
      )}
    </span>
  );
};

export default PresenceIndicator;