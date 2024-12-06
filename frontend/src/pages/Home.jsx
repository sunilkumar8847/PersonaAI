import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {
    return (
        <div className="home-container">
            <h1 className="home-title">Welcome to the AI Chatbot</h1>
            <p className="home-description">
                An AI-powered chatbot that mimics the persona of any Twitter user!
            </p>
            <Link to="/chat" className="chat-link">
                Start Chatting
            </Link>
        </div>
    );
};

export default Home;
