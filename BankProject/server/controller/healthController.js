// controller/healthController.js
const db = require('../config/db'); 
const transporter = require('../config/mailer');

async function checkHealth(req, res) {
    const healthInfo = {
        status: "UP",
        timestamp: new Date().toISOString(),
        // הוספת נתוני השרת עצמו:
        server: "healthy", 
        uptime: `${Math.floor(process.uptime())}s`, // כמה שניות השרת רץ ברצף
        memoryUsage: {
            heapUsedMB: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB` // צריכת זיכרון נוכחית
        },
        services: {
            database: "unknown",
            mailer: "unknown"
        }
    };

    try {
        await Promise.all([
            db.query('SELECT 1')
                .then(() => { healthInfo.services.database = "healthy"; })
                .catch((err) => { 
                    healthInfo.services.database = "unhealthy";
                    healthInfo.status = "DOWN";
                    console.error("Health Check - DB Error:", err.message);
                }),

            transporter.verify()
                .then(() => { healthInfo.services.mailer = "healthy"; })
                .catch((err) => {
                    healthInfo.services.mailer = "unhealthy";
                    healthInfo.status = "DOWN";
                    console.error("Health Check - Mailer Error:", err.message);
                })
        ]);

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