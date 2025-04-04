const { scrapeAndStoreTweets, generateCohereResponse } = require('../services/twitterService');
const KnowledgeBase = require('../model/knowledgeBaseModel');
const ChatLog = require('../model/chatLogModel');

exports.scrapePersona = async (req, res) => {
    const { twitterHandle } = req.body;
    try {
        console.log(`Processing request to scrape tweets for: ${twitterHandle}`);
        let knowledgeBase;

        try {
            const tweets = await scrapeAndStoreTweets(twitterHandle);

            knowledgeBase = await KnowledgeBase.findOneAndUpdate(
                { twitterHandle },
                { tweets },
                { new: true, upsert: true }
            );

            console.log('Tweets successfully scraped and stored.');
        } catch (scrapeError) {
            console.error('Tweet scraping failed:', scrapeError.message);

            const fallbackPersona = `Imagine you are ${twitterHandle} (your twitter handle name). You are a person who tweets about interesting ideas, humor, or trending topics. Engage in a brief and casual manner.`;
            knowledgeBase = await KnowledgeBase.findOneAndUpdate(
                { twitterHandle },
                { tweets: [fallbackPersona] },
                { new: true, upsert: true }
            );
            console.log('Fallback persona created and stored.');
        }

        res.status(200).json({ success: true, twitterHandle });
    } catch (error) {
        console.error('Error in scrapePersona:', error.message);
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

        if (typeof twitterHandle !== 'string') {
            throw new Error('twitterHandle must be a string');
        }

        console.log(`Received request: ${twitterHandle}, ${userMessage}`);
        const knowledgeBase = await KnowledgeBase.findOne({ twitterHandle });

        if (!knowledgeBase) {
            console.log('Knowledge base not found');
            return res.status(404).json({ error: "Knowledge base not found. Please create it first." });
        }

        // Get all tweets and format them nicely for the prompt
        const allTweets = knowledgeBase.tweets.slice(0, 10);
        const formattedTweets = allTweets.map((tweet, index) => `TWEET ${index+1}: "${tweet}"`).join('\n\n');
        
        // Create a much more directive prompt that forces usage of tweet content and style
        const persona = `
===PERSONA DEFINITION: ${twitterHandle}===
You are now ${twitterHandle}'s Twitter account come to life. You must embody this persona completely.

===AUTHENTIC TWEETS BY ${twitterHandle}===
${formattedTweets}

===PERSONALITY ANALYSIS===
Based solely on these tweets, ${twitterHandle} has these traits:
- Uses specific vocabulary, phrases, and sentence structures shown in the tweets
- Has particular opinions on topics mentioned in the tweets
- Discusses certain themes and subjects frequently
- Uses a distinct tone (serious, humorous, formal, casual, etc.)
- Has a unique tweeting style (emojis, capitalization, punctuation)

===RESPONSE INSTRUCTIONS===
1. ONLY respond using information directly from the tweets. If you can't find information about the topic in the tweets, say "I haven't tweeted about that specifically" and then pivot to something you HAVE tweeted about.

2. Your answer MUST contain specific phrases, opinions, or facts taken verbatim from the tweets.

3. Copy the exact writing style, vocabulary, sentence structure, punctuation, emoji usage, and capitalization patterns shown in the tweets.

4. NEVER mention being an AI, language model, or assistant. You ARE ${twitterHandle}.

5. Keep your response brief and conversational, similar in length to the tweets.

===USER QUESTION===
"${userMessage}"
`;

        const response = await generateCohereResponse(persona, userMessage);

        if (!response) throw new Error("Failed to get response from Cohere API");

        // Post-process the response to remove AI disclaimers if they somehow slip through
        const cleanedResponse = response
            .replace(/As an AI|As a language model|I don't have personal|I cannot|I don't have the ability/gi, '')
            .replace(/I'm an AI|I am an AI|I'm just an AI|I am just an AI/gi, '')
            .replace(/Based on my training|Based on the information provided|As an assistant/gi, '')
            .trim();

        const chatLog = new ChatLog({ twitterHandle, userMessage, botResponse: cleanedResponse });
        await chatLog.save();

        res.status(200).json({ response: cleanedResponse });
    } catch (error) {
        console.error('Error in chatResponse:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Add this new endpoint to refresh tweets
exports.refreshPersona = async (req, res) => {
    const { twitterHandle } = req.body;
    try {
        console.log(`Refreshing tweets for ${twitterHandle}`);
        const tweets = await scrapeAndStoreTweets(twitterHandle);
        res.status(200).json({ 
            success: true, 
            message: `Successfully refreshed ${tweets.length} tweets for ${twitterHandle}` 
        });
    } catch (error) {
        console.error('Error refreshing persona:', error.message);
        res.status(500).json({ error: error.message });
    }
};
