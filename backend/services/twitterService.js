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
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,1024'],
        });

        const page = await browser.newPage();
        
        // Set a more realistic user agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        
        // Create a custom wait function
        const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        
        console.log(`Navigating to Twitter profile: ${username}`);
        await page.goto(`https://twitter.com/${username}`, { 
            waitUntil: 'networkidle0',
            timeout: 60000
        });
        
        // Wait for initial content to load
        await wait(3000);
        
        // Improved scrolling function with more scrolls
        console.log('Starting to scroll page to load more tweets');
        for (let i = 0; i < 10; i++) {
            await page.evaluate(() => {
                window.scrollBy(0, 1000);
            });
            console.log(`Scroll ${i+1} completed`);
            await wait(1500); // Wait between scrolls
        }
        
        // Try multiple tweet selectors (Twitter changes their DOM frequently)
        const tweetSelectors = [
            'article div[lang]',
            'div[data-testid="tweetText"]',
            'div[data-testid="tweet"] div[lang]',
            'article[data-testid="tweet"] div[lang]'
        ];
        
        let tweets = [];
        
        // Try different selectors to find tweets
        for (const selector of tweetSelectors) {
            console.log(`Trying selector: ${selector}`);
            try {
                await page.waitForSelector(selector, { timeout: 5000 });
                
                // Take screenshot for debugging
                await page.screenshot({ path: `${username}-tweets.png` });
                
                tweets = await page.evaluate((sel) => {
                    const tweetElements = document.querySelectorAll(sel);
                    console.log(`Found ${tweetElements.length} tweet elements`);
                    return Array.from(tweetElements)
                        .map(tweet => tweet.innerText.trim())
                        .filter(text => text.length > 0);
                }, selector);
                
                if (tweets.length > 0) {
                    console.log(`Found ${tweets.length} tweets using selector: ${selector}`);
                    break;
                }
            } catch (error) {
                console.log(`Selector ${selector} failed: ${error.message}`);
            }
        }
        
        // If still low tweet count, try an alternative approach
        if (tweets.length < 5) {
            console.log('Low tweet count, trying alternative approach');
            await page.reload({ waitUntil: 'networkidle0' });
            await wait(5000);
            
            // More aggressive scrolling
            for (let i = 0; i < 15; i++) {
                await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
                await wait(2000);
            }
            
            // Try a broader selector
            tweets = await page.evaluate(() => {
                const articles = document.querySelectorAll('article');
                return Array.from(articles)
                    .map(article => {
                        const textDivs = article.querySelectorAll('div');
                        for (const div of textDivs) {
                            if (div.innerText && div.innerText.length > 20) {
                                return div.innerText.trim();
                            }
                        }
                        return null;
                    })
                    .filter(text => text !== null);
            });
        }
        
        await browser.close();
        browser = null;
        
        if (tweets.length === 0) {
            throw new Error('No tweets could be scraped');
        }
        
        // Remove duplicates and limit to 20 tweets
        const uniqueTweets = [...new Set(tweets)].slice(0, 20);
        
        console.log(`Successfully scraped ${uniqueTweets.length} tweets for ${username}`);
        uniqueTweets.forEach((tweet, i) => {
            console.log(`Tweet ${i+1}: "${tweet.substring(0, 50)}..."`);
        });
        
        const existingRecord = await KnowledgeBase.findOne({ twitterHandle: username });
        if (existingRecord) {
            existingRecord.tweets = uniqueTweets;
            await existingRecord.save();
        } else {
            const newRecord = new KnowledgeBase({
                twitterHandle: username,
                tweets: uniqueTweets,
            });
            await newRecord.save();
        }
        
        console.log(`Tweets stored for ${username}`);
        return uniqueTweets;
    } catch (error) {
        if (browser) await browser.close();
        console.error(`Failed to scrape tweets for ${username}:`, error.message);
        throw new Error(`Failed to scrape tweets: ${error.message}`);
    }
};


exports.generateCohereResponse = async (persona, message) => {
    try {
        console.log(`Preparing to send request to Cohere API`);
        
        // Send persona structure as preamble to better guide the model
        const response = await cohereClient.post('v1/chat', {
            model: 'command-xlarge-nightly',
            message: message,
            chat_history: [],
            preamble: persona,
            temperature: 0.7,
            p: 0.75,  // Top-p sampling 
            frequency_penalty: 0.2,  // Reduce repetition
            presence_penalty: 0.4,   // Encourage more diverse content
            max_tokens: 250,
        });

        console.log('Received Cohere API response');
        
        if (!response.data) {
            throw new Error('Empty response from Cohere API');
        }
        
        // Extract text from response
        let responseText;
        
        if (response.data.text) {
            responseText = response.data.text;
        } else if (response.data.generation && response.data.generation.text) {
            responseText = response.data.generation.text;
        } else if (response.data.message) {
            responseText = response.data.message;
        } else if (response.data.response) {
            responseText = response.data.response;
        } else {
            console.error('Unknown response structure from Cohere:', JSON.stringify(response.data));
            throw new Error('Could not find text in Cohere API response');
        }
        
        return responseText.trim();
    } catch (error) {
        console.error('Error with Cohere API request:', error);
        throw new Error('Failed to generate response: ' + error.message);
    }
};
