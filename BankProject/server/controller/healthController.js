// controller/healthController.js
const db = require('../config/db');
const logger = require('../config/logger').child({ module: 'healthController' });

async function checkHealth(req, res)
{
    const healthInfo =
    {
        status: "UP",
        timestamp: new Date().toISOString(),
        server: "healthy",
        memoryUsage: {
            heapUsedMB: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`
        },
        services: {
            database: "unknown"
        }
    };

    try
    {
        await db.query('SELECT 1')
            .then(() => { healthInfo.services.database = "healthy"; })
            .catch((err) => {
                healthInfo.services.database = "unhealthy";
                healthInfo.status = "DOWN";
                logger.error("Health check failed", { service: "database", error: err.message });
            });

        if (healthInfo.status === "DOWN") {
            return res.status(503).json(healthInfo);
        }

        return res.status(200).json(healthInfo);

    } catch (globalError) {
        healthInfo.status = "DOWN";
        return res.status(500).json({ error: "Internal error during health check", details: globalError.message });
    }
}

module.exports = {
    checkHealth
};
