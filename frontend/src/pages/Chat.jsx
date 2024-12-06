import React from 'react';
import ChatBox from '../components/ChatBox';
import '../styles/Chat.css';

const Chat = () => {
    return (
        <div className="chat-page-container">
            <h1 className="chat-title">Chat with AI</h1>
            <ChatBox />
        </div>
    );
};

export default Chat;
