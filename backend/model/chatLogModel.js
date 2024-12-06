const mongoose = require('mongoose');

const chatLogSchema = new mongoose.Schema({
    twitterHandle: {
        type: String,
        required: true
    },
    userMessage: {
        type: String,
        required: true
    },
    botResponse: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const ChatLog = mongoose.model('ChatLog', chatLogSchema);

module.exports = ChatLog;
