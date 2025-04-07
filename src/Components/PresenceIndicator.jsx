import React from "react";
import useUserPresence from "../hooks/useUserPresence";

const PresenceIndicator = ({ uid }) => {
  const online = useUserPresence(uid);
  return (
    <div
      className={`w-3 h-3 rounded-full border-2 border-white ${online ? "bg-green-500" : "bg-gray-300"}`}
      title={online ? "Online" : "Offline"}
    ></div>
  );
};

export default PresenceIndicator;
