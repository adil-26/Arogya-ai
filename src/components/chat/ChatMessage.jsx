import React, { useState, useEffect } from 'react';
import { Bot, User, Paperclip, FileText } from 'lucide-react';
import './ChatMessage.css';

const ChatMessage = ({ message }) => {
    const isAI = message.sender === 'ai';
    const [timeString, setTimeString] = useState('');

    // Format time on client side only to avoid hydration mismatch
    useEffect(() => {
        const date = new Date(message.timestamp);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        setTimeString(`${hours}:${minutes}`);
    }, [message.timestamp]);

    return (
        <div className={`chat-message ${isAI ? 'ai' : 'user'}`}>
            <div className="message-avatar">
                {isAI ? <Bot size={20} /> : <User size={20} />}
            </div>
            <div className="message-content">
                <div className="message-bubble">
                    {message.text}
                    {message.attachment && (
                        <div className="attachment-preview">
                            <FileText size={16} />
                            <span>{message.attachment.name}</span>
                        </div>
                    )}
                </div>
                <div className="message-time">
                    {timeString}
                </div>
            </div>
        </div>
    );
};

export default ChatMessage;
