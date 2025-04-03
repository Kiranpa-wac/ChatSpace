import React from "react";
import useUserPresence from "../hooks/useUserPresence";

const PresenceIndicator = ({ uid }) => {
  const online = useUserPresence(uid);
  return (
    <span
      style={{
        width: "20px",
        height: "20px",
        backgroundColor: online ? "yellow"  : "gray",
        borderRadius: "50%",
        display: "inline-block",
      }}
      title={online ? "Online" : "Offline"}
    ></span>
  );
};

export default PresenceIndicator;
