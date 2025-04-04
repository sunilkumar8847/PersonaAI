import React, { useState, useEffect, useRef } from 'react';
import { IoMdSend } from "react-icons/io";
import { sendChatMessage } from '../services/apiService';
import { FaInfoCircle, FaTwitter, FaSync } from 'react-icons/fa';

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
    const [isTyping, setIsTyping] = useState(false);
    const [error, setError] = useState('');
    const chatContainerRef = useRef(null);
    const inputRef = useRef(null);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        // Focus the input field when component mounts
        if (inputRef.current) {
            inputRef.current.focus();
        }
        
        // Add welcome message
        setChatHistory([{
            bot: `Hi there! I'm @${twitterHandle.twitterHandle}. What would you like to chat about?`,
            botTime: getCurrentTime()
        }]);
    }, [twitterHandle]);

    const handleChat = async () => {
        if (!userMessage.trim()) return;
        setError('');

        const newChatHistory = [
            ...chatHistory,
            { user: userMessage, userTime: getCurrentTime(), bot: null },
        ];
        setChatHistory(newChatHistory);
        setUserMessage('');
        setIsTyping(true);

        try {
            const data = await sendChatMessage(twitterHandle, userMessage);

            setChatHistory((prev) =>
                prev.map((chat, idx) =>
                    idx === prev.length - 1 ? { ...chat, bot: data?.response ?? 'No response available', botTime: getCurrentTime() } : chat
                )
            );
        } catch (error) {
            setError("Failed to get a response. Please try again.");
            console.error("Chat error:", error);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleChat();
        }
    };

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory, isTyping]);

    // Create initials avatar for the Twitter persona
    const getInitials = () => {
        const name = twitterHandle.twitterHandle;
        return name.substring(0, 2).toUpperCase();
    };

    const refreshPersona = async () => {
        setRefreshing(true);
        try {
            const response = await fetch('http://localhost:5000/api/refresh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ twitterHandle: twitterHandle.twitterHandle }),
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (data.success) {
                setChatHistory(prev => [
                    ...prev,
                    { 
                        bot: "I've updated my knowledge with the latest tweets! Ask me anything new.", 
                        botTime: getCurrentTime() 
                    }
                ]);
            } else {
                setError("Couldn't refresh tweets. Please try again.");
            }
        } catch (error) {
            console.error("Error refreshing persona:", error);
            setError("Failed to refresh. Please try again later.");
        } finally {
            setRefreshing(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gradient-to-b from-gray-900 to-black font-inter">
            <div className="px-4 py-3 bg-blue-500/10 border-b border-blue-900/30">
                <div className="flex items-center justify-between mx-4 sm:mx-8 md:mx-16 lg:mx-32">
                    <div className="flex items-center">
                        <FaTwitter className="text-blue-400 mr-2" />
                        <p className="text-sm text-gray-300">
                            You're chatting with an AI persona based on @{twitterHandle.twitterHandle}'s Twitter profile
                        </p>
                    </div>
                    <button 
                        onClick={refreshPersona} 
                        disabled={refreshing}
                        className={`flex items-center text-xs bg-blue-900/40 hover:bg-blue-800/60 text-blue-300 px-3 py-1 rounded-full transition ${refreshing ? 'opacity-50' : ''}`}
                    >
                        <FaSync className={`mr-1 ${refreshing ? 'animate-spin' : ''}`} /> 
                        {refreshing ? 'Refreshing...' : 'Refresh Tweets'}
                    </button>
                </div>
            </div>

            <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-6 mx-4 sm:mx-8 md:mx-16 lg:mx-32 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900"
            >
                {chatHistory.map((entry, idx) => (
                    <div key={idx} className="flex flex-col space-y-6">
                        {entry.bot && !entry.user && (
                            <div className="flex justify-start">
                                <div className="flex flex-col max-w-[85%] sm:max-w-sm md:max-w-md lg:max-w-lg">
                                    <div className="flex items-start">
                                        <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mr-3 text-white flex items-center justify-center text-md font-bold">
                                            {getInitials()}
                                        </div>
                                        <div>
                                            <div className="bg-gray-800/80 text-white p-4 rounded-tl-sm rounded-tr-2xl rounded-br-2xl rounded-bl-2xl shadow-md break-words">
                                                <p className="text-sm leading-relaxed">{entry.bot}</p>
                                            </div>
                                            <span className="text-xs block mt-1 text-gray-500 ml-1">{entry.botTime}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {entry.user && (
                            <div className="flex justify-end">
                                <div className="flex flex-col max-w-[85%] sm:max-w-sm md:max-w-md lg:max-w-lg">
                                    <div className="bg-blue-600/30 text-white p-4 rounded-tl-2xl rounded-tr-sm rounded-br-2xl rounded-bl-2xl shadow-md break-words backdrop-blur-sm border border-blue-500/20">
                                        <p className="text-sm">{entry.user}</p>
                                    </div>
                                    <span className="text-xs block mt-1 text-gray-500 text-right mr-1">{entry.userTime}</span>
                                </div>
                            </div>
                        )}

                        {entry.bot && entry.user && (
                            <div className="flex justify-start">
                                <div className="flex flex-col max-w-[85%] sm:max-w-sm md:max-w-md lg:max-w-lg">
                                    <div className="flex items-start">
                                        <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mr-3 text-white flex items-center justify-center text-md font-bold">
                                            {getInitials()}
                                        </div>
                                        <div>
                                            <div className="bg-gray-800/80 text-white p-4 rounded-tl-sm rounded-tr-2xl rounded-br-2xl rounded-bl-2xl shadow-md break-words">
                                                <p className="text-sm leading-relaxed">{entry.bot}</p>
                                            </div>
                                            <span className="text-xs block mt-1 text-gray-500 ml-1">{entry.botTime}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="flex items-start">
                            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mr-3 text-white flex items-center justify-center text-md font-bold">
                                {getInitials()}
                            </div>
                            <div className="bg-gray-800/80 text-white p-3 rounded-2xl shadow-md">
                                <div className="flex space-x-2 items-center px-2">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-150"></div>
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-300"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {error && (
                    <div className="flex justify-center">
                        <div className="bg-red-500/20 text-red-300 text-sm py-2 px-4 rounded-lg border border-red-500/30">
                            {error}
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-gray-900/80 backdrop-blur-sm p-4 border-t border-gray-800 sticky bottom-0">
                <div className="flex flex-col mx-4 sm:mx-8 md:mx-16 lg:mx-32">
                    <div className="relative flex items-center">
                        <textarea
                            ref={inputRef}
                            placeholder="Type your message here..."
                            value={userMessage}
                            onChange={(e) => setUserMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            rows={1}
                            className="flex-1 p-3 pl-4 border bg-gray-800/50 text-white border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-2xl resize-none transition-all"
                        />
                        <button
                            onClick={handleChat}
                            disabled={!userMessage.trim() || isTyping}
                            className={`absolute right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition duration-300 ${
                                !userMessage.trim() || isTyping ? 'opacity-50 cursor-not-allowed' : 'opacity-100'
                            }`}
                        >
                            <IoMdSend className="h-5 w-5" />
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                        Press Enter to send, Shift+Enter for a new line
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ChatBox;
