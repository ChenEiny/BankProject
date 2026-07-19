const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');
const verifyToken = require('../middleware/authMiddleware');
const { safeController } = require('../middleware/errorWrapper'); // מייבאים את המעטפת

router.post('/login', (req, res, next) => {
    let token = null;

    if (req.cookies && req.cookies.token) 
    {
        token = req.cookies.token;
    } 
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) 
    {
        token = req.headers.authorization.split(' ')[1];
    }

    if (token && token !== 'null' && token !== 'undefined' && token.trim() !== '') 
    {
        return res.status(400).json({ 
            error: "You are already logged in. Please log out before logging into another account." 
        });
    }
    
    next();
}, safeController(authController.login)); // 👈 עטוף בבטחה

router.post('/signup', safeController(authController.register)); // 👈 עטוף בבטחה
router.get('/users', safeController(authController.getUsers));   // 👈 עטוף בבטחה

router.get('/me', verifyToken, (req, res) => {
    return res.status(200).json({
        message: "You are active and authenticated!",
        user: req.user
    });
});

router.get('/verify-email', safeController(authController.verifyEmail)); // 👈 עטוף בבטחה
router.post('/logout', verifyToken, safeController(authController.logout)); // 👈 עטוף בבטחה

module.exports = router;