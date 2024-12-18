const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const axios = require('axios');
const KnowledgeBase = require('../model/knowledgeBaseModel');

puppeteer.use(StealthPlugin());

const cohereClient = axios.create({
    baseURL: 'https://api.cohere.ai/',
    timeout: 60000,
    headers: {
        Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
        'Content-Type': 'application/json',
    },
});

exports.scrapeAndStoreTweets = async (username) => {
    console.log(`Scraping tweets for user: ${username}`);
    let browser = null;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const page = await browser.newPage();
        await page.goto(`https://twitter.com/${username}`, { waitUntil: 'networkidle0' });

        const scrollPageToEnd = async (page) => {
            let previousHeight = await page.evaluate(() => document.body.scrollHeight);
            while (true) {
                try {
                    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
                    await new Promise((resolve) => setTimeout(resolve, 2000));
                    const currentHeight = await page.evaluate(() => document.body.scrollHeight);
                    if (currentHeight === previousHeight) break;
                    previousHeight = currentHeight;
                } catch (e) {
                    console.error('Error while scrolling:', e.message);
                    break;
                }
            }
        };

        await scrollPageToEnd(page);

        try {
            await page.waitForSelector('article div[lang]', { timeout: 5000 });
            console.log('Selector "article div[lang]" found.');
        } catch (error) {
            if (error.name === 'TimeoutError') {
                console.error('Selector "article div[lang]" not found within the timeout.');
            } else {
                console.error('Error while checking for selector:', error);
            }
        }
        await page.waitForSelector('article div[lang]', { timeout: 60000 });

        const tweets = await page.evaluate(() => {
            const tweetElements = document.querySelectorAll('article div[lang]');
            return Array.from(tweetElements)
                .slice(0, 10)
                .map((tweet) => tweet.innerText.trim())
                .filter((text) => text.length > 0);
        });

        await browser.close();

        if (tweets.length === 0) {
            throw new Error('No tweets could be scraped');
        }

        const existingRecord = await KnowledgeBase.findOne({ twitterHandle: username });
        if (existingRecord) {
            existingRecord.tweets = tweets;
            await existingRecord.save();
        } else {
            const newRecord = new KnowledgeBase({
                twitterHandle: username,
                tweets: tweets,
            });
            await newRecord.save();
        }

        console.log(`Tweets stored for ${username}`);
        return tweets;
    } catch (error) {
        if (browser) await browser.close();
        console.error(`Failed to scrape tweets for ${username}:`, error.message);
        throw new Error(`Failed to scrape tweets: ${error.message}`);
    }
};


exports.generateCohereResponse = async (persona, message) => {
    try {
        console.log(`Sending request to Cohere API with persona: ${persona}`);
        const response = await cohereClient.post('generate', {
            model: 'command-xlarge-nightly',
            prompt: `${persona}\n\nUser: ${message}\nBot:`,
            max_tokens: 300,
            temperature: 0.7,
            k: 0,
            p: 0.75,
            frequency_penalty: 0,
            presence_penalty: 0,
            stop_sequences: ['\n'],
        });

        if (!response.data || !response.data.text) {
            throw new Error('No valid text received from Cohere API');
        }

        console.log('Cohere API Response:', response.data.text);
        const generatedResponse = Array.isArray(response.data.text)
            ? response.data.text[0]?.trim() || 'No response generated'
            : response.data.text.trim();
        return generatedResponse;
    } catch (error) {
        console.error('Error with Cohere API request:', error);
        throw new Error('Failed to generate response: ' + error.message);
    }
};
