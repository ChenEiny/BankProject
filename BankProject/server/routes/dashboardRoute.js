const express = require('express');
const router = express.Router();
const dashboardController = require('../controller/dashboardController');
const authenticateToken = require('../middleware/authMiddleware'); 
const { safeController } = require('../middleware/errorWrapper'); 

router.get('/', authenticateToken, safeController(dashboardController.getDashboardData));

module.exports = router;