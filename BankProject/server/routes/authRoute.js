const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');
const verifyToken = require('../middleware/authMiddleware');

router.post('/login', authController.login);

router.post('/signup', authController.register);

router.get('/users', authController.getUsers);//temporary check for the user exists

router.get('/me', verifyToken, (req, res) => 
    {
    return res.status(200).json({
        message: "You are active and authenticated!",
        user: req.user
    });
});

router.get('/verify-email', authController.verifyEmail);

router.post('/logout', (req, res) => {
    res.status(201).json({ message: "Logout Requested" });
});

module.exports = router;