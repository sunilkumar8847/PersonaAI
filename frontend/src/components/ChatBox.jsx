import React, { useState } from 'react';
import axios from '../services/apiService';
import '../styles/ChatBox.css';

const ChatBox = () => {
    const [twitterHandle, setTwitterHandle] = useState('');
    const [userMessage, setUserMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleChat = async () => {
        if (!twitterHandle || !userMessage) return alert("Please provide both fields!");

        setLoading(true);
        try {
            const { data } = await axios.post('/chat', { twitterHandle, userMessage });
            setChatHistory([...chatHistory, { user: userMessage, bot: data.response }]);
            setUserMessage('');
        } catch (error) {
            console.error('Error fetching response:', error);
        }
        setLoading(false);
    };

    return (
        <div className="chat-container">
            <div className="input-container">
                <input
                    type="text"
                    placeholder="Enter Twitter Handle"
                    value={twitterHandle}
                    onChange={(e) => setTwitterHandle(e.target.value)}
                    className="input-field"
                />
                <input
                    type="text"
                    placeholder="Type your message here..."
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value)}
                    className="input-field"
                />
                <button onClick={handleChat} disabled={loading} className="send-button">
                    {loading ? 'Sending...' : 'Send'}
                </button>
            </div>
            <div className="chat-history">
                {chatHistory.map((entry, idx) => (
                    <div key={idx} className="chat-entry">
                        <p><strong>You:</strong> {entry.user}</p>
                        <p><strong>Bot:</strong> {entry.bot}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChatBox;
