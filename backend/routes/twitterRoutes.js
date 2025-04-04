const express = require('express');
const {scrapePersona, chatResponse, refreshPersona} = require('../controllers/twitterController')
const router = express.Router();

router.post('/scrap', scrapePersona);
router.post('/chat', chatResponse);
router.post('/refresh', refreshPersona);

module.exports = router;
