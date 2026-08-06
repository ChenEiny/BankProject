const logger = require('../config/logger');

const requestLogger = (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        logger.http('HTTP request', {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            durationMs: Date.now() - start,
            ip: req.ip,
            userId: req.user?.id || null,
        });
    });

    next();
};

module.exports = requestLogger;
