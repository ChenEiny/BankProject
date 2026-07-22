const express = require('express');
const router = express.Router();

const { safeController } = require('../middleware/errorWrapper');

const authMiddleware = require('../middleware/authMiddleware');

const { handleChatMessage } = require('../controller/chatController');

router.post('/', authMiddleware, safeController(handleChatMessage));

module.exports = router;