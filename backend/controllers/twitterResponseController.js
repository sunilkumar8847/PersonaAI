const { scrapeAndStoreTweets, generateCohereResponse } = require('../services/twitterService');
const KnowledgeBase = require('../model/knowledgeBaseModel');
const ChatLog = require('../model/chatLogModel');

exports.getResponse = async (req, res) => {
    try {
        const { userMessage } = req.body;
        const knowledgeBase = await KnowledgeBase.findOne({ twitterHandle });

        if (!knowledgeBase) {
            return res.status(404).json({ error: "Knowledge base not found. Please create it first." });
        }

        const persona = `You are ${twitterHandle}, known for your unique tone and ideas. Here are some recent tweets: ${knowledgeBase.tweets.slice(0, 3).join(' ')}. Respond to user queries in a brief and engaging manner, avoiding lengthy responses.`;
        const response = await generateCohereResponse(persona, userMessage);

        if (!response) throw new Error("Failed to get response from Cohere API");

        const chatLog = new ChatLog({ twitterHandle, userMessage, botResponse: response });
        await chatLog.save();

        res.status(200).json({ response });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

