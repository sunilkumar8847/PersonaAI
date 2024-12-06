const { scrapeTweets, generateCohereResponse } = require('../services/twitterService');
const ChatLog = require('../model/chatLogModel');

exports.getChatResponse = async (req, res) => {
    const { twitterHandle, userMessage } = req.body;
    try {
        const tweets = await scrapeTweets(twitterHandle);

        if (tweets.length === 0) {
            return res.status(404).json({ 
                error: 'No tweets found for this handle. Unable to generate persona.' 
            });
        }

        const persona = `You are ${twitterHandle}, known for your unique tone and ideas. 
        Respond in a style consistent with these recent tweets: 
        ${tweets.join('\n')}
        
        Respond to the following message casually and authentically:`;

        const response = await generateCohereResponse(persona, userMessage);

        const chatLog = new ChatLog({
            twitterHandle,
            userMessage,
            botResponse: response
        });
        await chatLog.save();

        res.status(200).json({ response });
    } catch (error) {
        console.error('Error in getChatResponse:', error);
        res.status(500).json({ 
            error: error.message || 'An unexpected error occurred' 
        });
    }
};