const express = require('express');
const router = express.Router();
const transactionController = require('../controller/transactionController');
const authenticateToken = require('../middleware/authMiddleware'); 

router.post('/transfer', authenticateToken, transactionController.transfer);

router.get('/history', authenticateToken, transactionController.getHistory);

module.exports = router;