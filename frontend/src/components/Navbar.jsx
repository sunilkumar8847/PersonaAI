import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaTwitter, FaHome } from 'react-icons/fa';

function Navbar({ message }) {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  
  return (
    <header className="bg-gray-900/80 backdrop-blur-sm text-white shadow-lg border-b border-gray-800 sticky top-0 z-10">
      <nav className="container mx-auto flex items-center justify-between p-4">
        <Link to="/" className="flex items-center">
          <FaTwitter className="text-blue-400 text-xl mr-2" />
          <span className="font-bold text-lg bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            PersonaAI
          </span>
        </Link>
        
        {!isHomePage && (
          <div className="flex items-center">
            <div className="bg-blue-500/20 py-1 px-3 rounded-full flex items-center">
              <span className="text-blue-400 font-medium">@{message}</span>
            </div>
            <Link to="/" className="ml-4 p-2 text-gray-400 hover:text-white transition-colors">
              <FaHome />
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
