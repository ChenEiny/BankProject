const logger = require('../config/logger');

class AppError extends Error
{
    constructor(message, statusCode) 
    {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true; 
        Error.captureStackTrace(this, this.constructor);
    }
}
function safeController(controllerFn) 
{
    return async (req, res, next) => 
    {
        try 
        {
            const result = await controllerFn(req, res); 
            
            if (res.headersSent || result === undefined) 
            {
                return;
            }
            
            const statusCode = result._customStatus || 200;
            if (result._customStatus) delete result._customStatus;

            return res.status(statusCode).json(result);
        } catch (error) {
            next(error); 
        }
    };
}

function globalErrorHandler(err, req, res, next) 
{
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal server error";

    logger.error('Request error', {
        statusCode,
        message,
        method: req.method,
        path: req.originalUrl,
        stack: err.stack,
    });

    return res.status(statusCode).json({
        status: "error",
        error: message
    });
}

module.exports = { AppError, safeController, globalErrorHandler };