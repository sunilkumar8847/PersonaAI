import React from 'react';
import { useLocation } from 'react-router-dom';
import ChatBox from '../components/ChatBox';
import Navbar from '../components/Navbar';

const Chat = () => {
    const location = useLocation();
    const twitterHandle = location.state?.twitterHandle || 'Unknown User';

    return (
        <div className="chat-page-container">
            <Navbar message={`${twitterHandle}`} className="sticky top-0" />
            <ChatBox twitterHandle={{ twitterHandle }} className="mx-4 sm:mx-8 md:mx-20 lg:mx-36" />
        </div>
    );
};

export default Chat;
