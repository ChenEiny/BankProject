const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
});

async function initDatabase() {
    const createUsersTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            role VARCHAR(50) DEFAULT 'customer',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;
    try {
        await pool.query(createUsersTableQuery);
        console.log('✅ Users table is ready (verified/created)');
    } catch (err) {
        console.error('❌ Error creating users table:', err.stack);
    }
}

pool.query('SELECT NOW()', async (err, res) => {
    if (err) {
        console.error('❌ Database connection failed:', err.stack);
    } else {
        console.log('✅ Connected to PostgreSQL successfully');
        await initDatabase(); // מריץ את יצירת הטבלה מיד לאחר חיבור מוצלח
    }
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    connect: () => pool.connect()
};