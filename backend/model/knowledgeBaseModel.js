const mongoose = require('mongoose');

const knowledgeBaseSchema = new mongoose.Schema({
    twitterHandle: {
        type: String,
        required: true,
        unique: true
    },
    tweets: {
        type: [String],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const KnowledgeBase = mongoose.model('KnowledgeBase', knowledgeBaseSchema);
module.exports = KnowledgeBase;
