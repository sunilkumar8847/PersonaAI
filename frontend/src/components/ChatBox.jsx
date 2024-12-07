import React, { useState, useEffect, useRef } from 'react';
import axios from '../services/apiService';
import { IoMdSend } from "react-icons/io";

const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
};

const ChatBox = ({ twitterHandle }) => {
    const [userMessage, setUserMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const chatContainerRef = useRef(null);

    const handleChat = async () => {
        if (!twitterHandle || !userMessage.trim()) return alert("Please provide both fields!");

        const newChatHistory = [
            ...chatHistory,
            { user: userMessage, userTime: getCurrentTime(), bot: null }
        ];
        setChatHistory(newChatHistory);
        setUserMessage('');

        try {
            const { data } = await axios.post('/chat', { twitterHandle, userMessage });
            const updatedChatHistory = [...newChatHistory];
            updatedChatHistory[updatedChatHistory.length - 1].bot = data.response;
            updatedChatHistory[updatedChatHistory.length - 1].botTime = getCurrentTime();
            setChatHistory(updatedChatHistory);
        } catch (error) {
            console.error('Error fetching response:', error);
            alert('Failed to get a response from the server.');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleChat();
        }
    };

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory]);

    return (
        <div className="flex flex-col h-screen bg-black font-inter">
            <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 mx-32 "
            >
                {chatHistory.map((entry, idx) => (
                    <div key={idx} className="flex flex-col">

                        <div className="flex justify-end mb-2">
                            <div className='flex flex-col'>
                                <div className="bg-white text-black p-4 rounded-2xl shadow-md">
                                    <p className="text-sm">{entry.user}</p>
                                </div>
                                <span className="text-xs block mt-2 text-white justify-self-end ml-2">{entry.userTime}</span>
                            </div>
                        </div>

                        {entry.bot === null ? (
                            idx === chatHistory.length - 1 && (
                                <div className="flex justify-start mb-2">
                                    <div className='flex flex-col'>
                                        <div className='flex'>
                                            <div className='h-10 w-10 bg-gray-900 rounded-full mr-2 text-white flex items-center justify-center text-lg font-bold'>
                                                {twitterHandle[0].toUpperCase()}
                                            </div>
                                            <div className="bg-gray-900 text-white p-5 rounded-2xl max-w-lg shadow-md animate-pulse">
                                                <p className="text-sm">Typing...</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        ) : (
                            <div className="flex justify-start mb-2">
                                <div className='flex flex-col'>
                                    <div className='flex'>
                                        <div className='h-10 w-10 bg-gray-900 rounded-full mr-2 text-white flex items-center justify-center text-lg font-bold'>
                                            {twitterHandle[0].toUpperCase()}
                                        </div>
                                        <div className="bg-gray-900 text-white p-5 rounded-2xl max-w-lg shadow-md">
                                            <p className="text-sm">{entry.bot}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs block mt-2 text-white ml-14">{entry.botTime}</span>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="bg-gray-900 p-4 border-t border-gray-300 sticky bottom-0">
                <div className="flex items-center space-x-4 mx-32 mb-4 mt-2">
                    <input
                        type="text"
                        placeholder="Type your message here..."
                        value={userMessage}
                        onChange={(e) => setUserMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 p-2 pl-4 border bg-gray-800 text-white border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded-full"
                    />
                    <button
                        onClick={handleChat}
                        className="bg-gray-800 text-white px-4 py-2 hover:scale-125 hover:bg-gray-400 transition duration-300 disabled:bg-gray-300 rounded-full"
                    >
                        { <IoMdSend className='h-6 w-6' />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatBox;
