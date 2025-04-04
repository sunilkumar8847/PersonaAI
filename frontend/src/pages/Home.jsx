import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createKnowledgeBase } from '../services/apiService';
import Navbar from '../components/Navbar';
import { FaTwitter, FaArrowRight } from 'react-icons/fa';

const Home = () => {
    const [rawTwitterHandle, setRawTwitterHandle] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');
        const twitterHandle = rawTwitterHandle.trim().replace(/^@/, '');
        
        if (!twitterHandle) {
            setError('Please enter a Twitter username');
            return;
        }
        
        setLoading(true);
        try {
            const { success } = await createKnowledgeBase(twitterHandle);
            if (success) {
                navigate('/chat', { state: { twitterHandle } });
            }
        } catch (error) {
            setError('Failed to create persona. Please try again.');
            console.log("Failed to create knowledge base.", error);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleCreate(e);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gradient-to-b from-black to-gray-900 text-white font-sans">
            <Navbar message="Persona AI" />

            <div className="flex-1 flex flex-col items-center justify-center px-4">
                <div className="flex flex-col items-center justify-center mb-12 gap-3">
                    <div className="flex items-center mb-2">
                        <FaTwitter className="text-blue-400 text-4xl mr-3" />
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            PersonaAI
                        </h1>
                    </div>
                    <p className="text-gray-400 text-lg max-w-md text-center">
                        Chat with AI personas that think and respond just like your favorite Twitter personalities
                    </p>
                </div>
                
                <div className="w-full max-w-md bg-gray-800/50 p-6 rounded-xl shadow-lg backdrop-blur-sm border border-gray-700">
                    <form className="space-y-5" onSubmit={handleCreate}>
                        <div className="space-y-1">
                            <label className="text-sm text-gray-300 ml-1">Twitter Username</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                    @
                                </span>
                                <input
                                    type="text"
                                    placeholder="elonmusk"
                                    value={rawTwitterHandle}
                                    onChange={(e) => setRawTwitterHandle(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="w-full p-3 pl-8 border border-gray-600 bg-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                            {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
                        </div>
                        
                        <button
                            type="submit"
                            className={`w-full py-3 rounded-lg flex items-center justify-center transition duration-300 ${
                                loading
                                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                                    : "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
                            }`}
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating...
                                </div>
                            ) : (
                                <div className="flex items-center">
                                    Create Persona <FaArrowRight className="ml-2" />
                                </div>
                            )}
                        </button>
                    </form>
                </div>
                
                <div className="mt-8 text-gray-500 text-sm max-w-md text-center">
                    PersonaAI creates chat personalities based on public Twitter profiles
                </div>
            </div>
        </div>
    );
};

export default Home;
