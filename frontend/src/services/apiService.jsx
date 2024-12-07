import axios from 'axios';


const instance = axios.create({
    baseURL: 'https://persona-chat-backend.vercel.app/api',
    // baseURL: 'http://localhost:5000/api',
    // baseURL: `${process.env.BACKEND_URL}/api`,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default instance;