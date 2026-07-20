const express = require('express');
const router = express.Router();
const transactionController = require('../controller/transactionController');
const verifyToken = require('../middleware/authMiddleware'); 
const { safeController } = require('../middleware/errorWrapper'); 

router.post('/transfer', verifyToken, safeController(transactionController.transfer));
router.get('/history', verifyToken, safeController(transactionController.getHistory));

module.exports = router;