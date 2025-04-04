import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:5000/api',
    // baseURL: 'https://persona-chat-backend.vercel.app/api',
    // baseURL: `${process.env.BACKEND_URL}/api`,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const createKnowledgeBase = async (twitterHandle) => {
    try {
        const response = await instance.post('/scrap', { twitterHandle }); 
        console.log("createKnowledge response.data", response.data)
        return response.data;
    } catch (error) {
        console.error("Error creating knowledge base:", error);
        throw error;
    }
};

export const sendChatMessage = async (twitterHandle, userMessage) => {
    try {
        console.log(`Sending message: ${userMessage} to ${twitterHandle}`);
        const response = await instance.post('/chat', { twitterHandle  , userMessage });
        console.log('Server response:', response.data);
        console.log('Server response type:', typeof(response.data));
        return response.data;
    } catch (error) {
        console.error('Error getting chat response:', error);
        alert('Failed to get a response from the server.');
        throw error;
    }
};

