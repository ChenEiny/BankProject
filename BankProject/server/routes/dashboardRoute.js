const express = require('express');
const router = express.Router();
const dashboardController = require('../controller/dashboardController');
const authenticateToken = require('../middleware/authMiddleware'); // ודא שהנתיב ל-auth correct

router.get('/', authenticateToken, dashboardController.getDashboardData);

module.exports = router;