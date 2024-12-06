import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Home = () => {
    const [twitterHandle, setTwitterHandle] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();

        if (twitterHandle.trim()) {
            navigate('/chat', { state: { twitterHandle } });
        } else {
            alert('Please enter a valid Twitter handle');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSubmit();
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
                <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 mt-0">
                    <input
                        type="text"
                        placeholder="TwitterHandle (without @)"
                        value={twitterHandle}
                        onChange={(e) => setTwitterHandle(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full p-3 pl-4 border border-gray-700 bg-gray-800 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
                    />

                    <button
                        type="submit"
                        className="w-full bg-white text-black py-3 rounded-full hover:bg-gray-600 transition duration-300"
                    >
                        Create Persona
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Home;
