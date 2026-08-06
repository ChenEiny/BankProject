const jwt = require('jsonwebtoken');
const logger = require('../config/logger').child({ module: 'authMiddleware' });

function verifyToken(req, res, next)
{
    let token = null;

    if (req.cookies && req.cookies.token) 
    {
        token = req.cookies.token;
    } 
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token)
    {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; 
        next(); 
    } catch (error) 
    {
        logger.warn('JWT verification failed', {
            error: error.message,
            path: req.originalUrl,
        });

        if (error.name === 'TokenExpiredError') 
        {
            return res.status(401).json({ error: "Access denied. Token has expired." });
        }

        if (error.name === 'JsonWebTokenError') 
        {
            return res.status(401).json({ error: "Access denied. Invalid or malformed token." });
        }

        return res.status(401).json({ error: "Access denied. Authentication failed." });
    }
}

module.exports = verifyToken;