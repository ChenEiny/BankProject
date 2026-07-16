const db = require('../config/db');


const Account = {
    create: async (userId) => {
        const min = 500;
        const max = 5000;
        const randomBalance = parseFloat((Math.random() * (max - min) + min).toFixed(2));

        const query = `
            INSERT INTO accounts (user_id, balance) 
            VALUES ($1, $2) 
            RETURNING *;
        `;
        const { rows } = await db.query(query, [userId, randomBalance]);
        return rows[0];
    },

    findByUserId: async (userId) => {
        const query = `
            SELECT * FROM accounts 
            WHERE user_id = $1;
        `;
        const { rows } = await db.query(query, [userId]);
        return rows[0];
    },
    getDetailsByUserId: async (userId) => {
        const query = `
            SELECT a.id AS account_id, a.balance, u.email, u.phone 
            FROM accounts a
            JOIN users u ON a.user_id = u.id
            WHERE a.user_id = $1;
        `;
        const { rows } = await db.query(query, [userId]);
        return rows[0];
    }
};

module.exports = Account;