import React from 'react'
import { auth } from '../../firebase'

const ChatMessage = ({message}) => {
    const {text, senderId, photoUrl, senderName} = message
    const isCurrentUser = senderId === auth.currentUser.uid

    return (
        <div className={`flex items-start space-x-3 ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''} mb-4`}>
            <img
                src={photoUrl || 'https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png'}
                alt='avatar'
                className="w-10 h-10 rounded-full object-cover"
            />
            <div className={`
                max-w-[70%] p-3 rounded-lg 
                ${isCurrentUser 
                    ? 'bg-blue-500 text-white rounded-tr-none' 
                    : 'bg-gray-200 text-gray-800 rounded-tl-none'}
            `}>
                <p className="text-sm font-semibold mb-1">
                    {senderName}
                </p>
                <p className="text-sm">
                    {text}
                </p>
            </div>
        </div>
    )
}

export default ChatMessage