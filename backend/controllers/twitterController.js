//twitterController.js
const { scrapeAndStoreTweets, generateCohereResponse } = require('../services/twitterService');
const KnowledgeBase = require('../model/knowledgeBaseModel');
const ChatLog = require('../model/chatLogModel');

exports.getChatResponse = async (req, res) => {
    const { twitterHandle, userMessage } = req.body;
    try {
        let knowledgeBase = await KnowledgeBase.findOne({ twitterHandle: twitterHandle });

        if (!knowledgeBase) {
            console.log('No data found. Scraping tweets...');
            const tweets = await scrapeAndStoreTweets(twitterHandle);
            knowledgeBase = { twitterHandle, tweets };
        } else {
            console.log('Data found in the knowledge base');
        }

        // Prompt engineering for concise responses
        const persona = `You are ${twitterHandle}, known for your unique tone and ideas. Here are some recent tweets: ${knowledgeBase.tweets.slice(0, 3).join(' ')}. Respond to user queries in a brief and engaging manner, avoiding lengthy responses.`;

        const response = await generateCohereResponse(persona, userMessage);

        const chatLog = new ChatLog({
            twitterHandle,
            userMessage,
            botResponse: response
        });
        await chatLog.save();

        res.status(200).json({ response });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
