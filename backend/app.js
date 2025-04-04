require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const twitterRoutes = require('./routes/twitterRoutes');

const app = express();

app.use(bodyParser.json());

app.use(cors({
  origin: [
    // 'http://localhost:5173', 
    'http://localhost:5174', 
    // 'https://persona-chat-bot.vercel.app',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));


app.options('*', cors());

app.use((req, res, next) => {
  console.log('Request Origin:', req.headers.origin);
  console.log('Request Method:', req.method);
  next();
});

app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
  }).catch((error) => {
    console.error("MongoDB connection error:", error);
  });


app.use('/api', twitterRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
