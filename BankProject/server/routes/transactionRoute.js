const express = require('express');
const router = express.Router();
const transactionController = require('../controller/transactionController');
const verifyToken = require('../middleware/authMiddleware'); 

router.post('/transfer', verifyToken, transactionController.transfer);

router.get('/history', verifyToken, transactionController.getHistory);

module.exports = router;