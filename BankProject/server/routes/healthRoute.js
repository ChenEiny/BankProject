const express = require('express');
const router = express.Router();
const healthController = require('../controller/healthController');
const { safeController } = require('../middleware/errorWrapper.js'); 
router.get('/', safeController(healthController.checkHealth));

module.exports = router;