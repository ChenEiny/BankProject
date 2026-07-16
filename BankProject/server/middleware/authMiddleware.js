const jwt = require('jsonwebtoken');

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
        return res.status(400).json({ error: "Invalid token format or token expired." });
    }
}

module.exports = verifyToken;