import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://persona-chat-bot-backend1.vercel.app/api',
    // baseURL: `${process.env.BACKEND_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default instance;
