import React from 'react'
import useUserPresence from '../hooks/useUserPresence'

const PresenceIndicator = ({uid}) => {
    const online = useUserPresence(uid)
  return (
    <span className={`inline-block w-3 h-3 rounded-full ${online? "bg-green-500": "bg-gray-400"}`}
    title={online? "Online": "Offline"}
    ></span>
  )
}

export default PresenceIndicator
