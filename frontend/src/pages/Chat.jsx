import React from 'react';
import { useLocation } from 'react-router-dom';
import ChatBox from '../components/ChatBox';
import Navbar from '../components/Navbar';

const Chat = () => {
    const location = useLocation();
    const twitterHandle = location.state?.twitterHandle || 'Unknown User';

    return (
        <div className="chat-page-container">
            <Navbar message={`Chat with @${twitterHandle}`} />
            <ChatBox twitterHandle={twitterHandle} className="mx-36"/>
        </div>
    );
};

export default Chat;
