const { scrapeAndStoreTweets, generateCohereResponse } = require('../services/twitterService');
const KnowledgeBase = require('../model/knowledgeBaseModel');
const ChatLog = require('../model/chatLogModel');

exports.scrapePersona = async (req, res) => {
    const { twitterHandle } = req.body;
    try {
        let knowledgeBase = await KnowledgeBase.findOne({ twitterHandle });

        if (!knowledgeBase) {
            console.log('No data found. Scraping tweets...');
            const tweets = await scrapeAndStoreTweets(twitterHandle);
            knowledgeBase = new KnowledgeBase({ twitterHandle, tweets });
            await knowledgeBase.save();
        } else {
            console.log('Data found in the knowledge base');
        }

        res.status(200).json({ success: true, twitterHandle });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.chatResponse = async (req, res) => {
    try {
        console.log('Request body:', req.body);

        let { twitterHandle, userMessage } = req.body;

        if (typeof twitterHandle === 'object' && twitterHandle !== null) {
            if (twitterHandle.hasOwnProperty('twitterHandle')) {
                twitterHandle = twitterHandle.twitterHandle;
            } else {
                throw new Error('Invalid twitterHandle format');
            }
        }

        // Validate that twitterHandle is a string
        if (typeof twitterHandle !== 'string') {
            throw new Error('twitterHandle must be a string');
        }

        console.log(`Received request: ${twitterHandle}, ${userMessage}`);
        const knowledgeBase = await KnowledgeBase.findOne({ twitterHandle });

        if (!knowledgeBase) {
            console.log('Knowledge base not found');
            return res.status(404).json({ error: "Knowledge base not found. Please create it first." });
        }

        const persona = `You are ${twitterHandle}, known for your unique tone and ideas. Here are some recent tweets: ${knowledgeBase.tweets.slice(0, 3).join(' ')}. Respond to user queries in a brief and engaging manner, avoiding lengthy responses.`;
        const response = await generateCohereResponse(persona, userMessage);

        if (!response) throw new Error("Failed to get response from Cohere API");

        const chatLog = new ChatLog({ twitterHandle, userMessage, botResponse: response });
        await chatLog.save();

        res.status(200).json({ response });
    } catch (error) {
        console.error('Error in chatResponse:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
