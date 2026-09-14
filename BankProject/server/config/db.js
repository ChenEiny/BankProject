const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});
async function initDatabase() {
    const createUsersTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            role VARCHAR(50) DEFAULT 'customer',
            is_verified BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;
    const createAccountsTableQuery = `
        CREATE TABLE IF NOT EXISTS accounts (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id),
            balance NUMERIC(12, 2) NOT NULL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;
    const createTransactionsTableQuery = `
        CREATE TABLE IF NOT EXISTS transactions (
            id SERIAL PRIMARY KEY,
            sender_account_id INTEGER REFERENCES accounts(id),
            receiver_account_id INTEGER REFERENCES accounts(id),
            amount NUMERIC(12, 2) NOT NULL,
            transaction_type VARCHAR(50) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;
    try {
        await pool.query(createUsersTableQuery);
        console.log('✅ Users table is ready (verified/created)');
        await pool.query(createAccountsTableQuery);
        console.log('✅ Accounts table is ready (verified/created)');
        await pool.query(createTransactionsTableQuery);
        console.log('✅ Transactions table is ready (verified/created)');
    } catch (err) {
        console.error('❌ Error creating tables:', err.stack);
    }
}

pool.query('SELECT NOW()', async (err, res) => {
    if (err) {
        console.error('❌ Database connection failed:', err.stack);
    } else {
        console.log('✅ Connected to PostgreSQL successfully');
        await initDatabase(); 
    }
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    connect: () => pool.connect()
};