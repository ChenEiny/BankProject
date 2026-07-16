const db = require('../config/db');


class UserModel {
    static async findByEmail(email) 
    {
        const queryText = 'SELECT * FROM users WHERE email = $1;';
        const { rows } = await db.query(queryText, [email]);
        
        return rows[0]; 
    }

    static async createUser(userData) 
    {
        const { email, password, phone, role = 'customer' } = userData;
        
        const queryText = `
            INSERT INTO users (email, password, phone, role)
            VALUES ($1, $2, $3, $4)
            RETURNING id, email, phone, role, created_at;
        `;
        
        const values = [email, password, phone, role];
        
        const { rows } = await db.query(queryText, values);
        return rows[0];
    }

    static async getAllUsers() 
    {
        const queryText = 'SELECT id, email, phone, role, created_at FROM users;';
        const { rows } = await db.query(queryText);
        return rows;
    }
}

module.exports = UserModel;