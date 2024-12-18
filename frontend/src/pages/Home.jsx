import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createKnowledgeBase } from '../services/apiService';
import Navbar from '../components/Navbar';

const Home = () => {
    const [rawTwitterHandle, setRawTwitterHandle] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleCreate = async (e) => {
        e.preventDefault();
        const twitterHandle = rawTwitterHandle.trim().replace(/^@/, '');
        setLoading(true);
        try {
            const { success } = await createKnowledgeBase(twitterHandle);
            if (success) {
                navigate('/chat', { state: { twitterHandle } });
            }
        } catch (error) {
            console.log("Failed to create knowledge base.");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleCreate();
        }
    };

    return (
        <div className="flex flex-col h-screen bg-black text-white font-sans">
            <Navbar message="Persona AI" />

            <div className="flex-1 flex flex-col items-center justify-center px-4">
                <div className="flex flex-col items-center justify-center mb-16 gap-2">
                    <h1 className="text-5xl font-bold text-white">
                        AI Personas
                    </h1>
                    <p className="font-bold text-gray-500 text-md">
                        Create new AI Twitter personalities
                    </p>
                </div>
                <form className="w-full max-w-sm space-y-4 mt-0" onSubmit={handleCreate}>
                    <input
                        type="text"
                        placeholder="Enter Twitter Username (without @)"
                        value={rawTwitterHandle}
                        onChange={(e) => setRawTwitterHandle(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full p-3 pl-4 border border-gray-700 bg-gray-800 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
                    />
                    <button
                        type="submit"
                        className={`w-full py-3 rounded-full transition duration-300 ${loading
                            ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                            : "bg-white text-black hover:bg-gray-600"
                            }`}
                        disabled={loading}
                    >
                        {loading ? "Creating..." : "Create Persona"}
                    </button>
                </form>

            </div>
        </div>
    );
};

export default Home;
