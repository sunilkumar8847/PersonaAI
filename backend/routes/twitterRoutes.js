const express = require('express');
const { getChatResponse } = require('../controllers/twitterController');
const router = express.Router();

router.post('/chat', getChatResponse);

module.exports = router;
