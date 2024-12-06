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
        <h1 className="text-3xl font-bold mb-4 text-white">
          Enter a Twitter Handle
        </h1>
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
          <input
            type="text"
            placeholder="TwitterHandle (without @)"
            value={twitterHandle}
            onChange={(e) => setTwitterHandle(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full p-3 border border-gray-700 bg-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
          />

          <button
            type="submit"
            className="w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-600 transition duration-300"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default Home;
