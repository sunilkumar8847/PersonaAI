const express = require('express');
const {scrapePersona, chatResponse} = require('../controllers/twitterController')
const router = express.Router();

router.post('/scrap', scrapePersona);
router.post('/chat', chatResponse);

module.exports = router;
