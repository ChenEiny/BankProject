const rateLimit = require('express-rate-limit');

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        error: "Too Many Requests",
        message: "Too Many Requests in short time."
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Render polls /api/health every few seconds; without this it alone
    // exceeds the window and gets 429'd, which Render reads as unhealthy.
    skip: (req) => req.path === '/api/health',
});

const authLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 5,
    message: {
        error: "Too Many Login Attempts",
        message: "Too Many failed Attempts."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { generalLimiter, authLimiter };
