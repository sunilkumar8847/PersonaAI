const { scrapeAndStoreTweets} = require('../services/twitterService');
const KnowledgeBase = require('../model/knowledgeBaseModel');

exports.getScrappedData = async (req, res) => {
    const { twitterHandle } = req.body;
    try {
        const knowledgeBase = await KnowledgeBase.findOne({ twitterHandle: twitterHandle });

        if (!knowledgeBase) {
            console.log('No data found. Scraping tweets...');
            const tweets = await scrapeAndStoreTweets(twitterHandle);
            knowledgeBase = new KnowledgeBase({ twitterHandle, tweets });
            await knowledgeBase.save();

        } else {
            console.log('Data found in the knowledge base');
        }

        
        
        res.status(200).json({ twitterHandle });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
