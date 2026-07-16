const db = require('../config/db');

const Transaction = {
    transferMoney: async (senderUserId, receiverEmail, amount) => {
        const client = await db.connect();

        try {
            await client.query('BEGIN');

            const cleanSenderUserId = parseInt(senderUserId, 10);

            if (isNaN(cleanSenderUserId)) 
                {
                throw new Error('Invalid sender user ID format');
            }

            const findReceiverQuery = `
                SELECT u.id AS user_id, a.id AS account_id 
                FROM users u
                JOIN accounts a ON u.id = a.user_id
                WHERE u.email = $1;
            `;
            const receiverRes = await client.query(findReceiverQuery, [receiverEmail]);
            
            if (receiverRes.rows.length === 0) {
                throw new Error('Receiver email does not exist');
            }

            const receiver = receiverRes.rows[0];

            const findSenderQuery = `
                SELECT u.email, a.id AS account_id, a.balance 
                FROM users u
                JOIN accounts a ON u.id = a.user_id
                WHERE u.id = $1;
            `;
            const senderRes = await client.query(findSenderQuery, [cleanSenderUserId]);

            if (senderRes.rows.length === 0) {
                throw new Error('Sender account does not exist');
            }

            const sender = senderRes.rows[0];

            if (sender.account_id === receiver.account_id) {
                throw new Error('Cannot transfer money to yourself');
            }

            const senderBalance = parseFloat(sender.balance);
            if (senderBalance < amount) 
            {
                throw new Error('Insufficient balance');
            }

            const deductQuery = `
                UPDATE accounts 
                SET balance = balance - $1 
                WHERE id = $2;
            `;
            await client.query(deductQuery, [amount, sender.account_id]);

            const addQuery = `
                UPDATE accounts 
                SET balance = balance + $1 
                WHERE id = $2;
            `;
            await client.query(addQuery, [amount, receiver.account_id]);

            const recordTransactionQuery = `
                INSERT INTO transactions (sender_account_id, receiver_account_id, amount, transaction_type)
                VALUES ($1, $2, $3, 'transfer')
                RETURNING *;
            `;
            const transactionRes = await client.query(recordTransactionQuery, [
                sender.account_id,
                receiver.account_id,
                amount
            ]);

            await client.query('COMMIT');

            return {
                transactionId: transactionRes.rows[0].id,
                amount: amount,
                sender: {
                    email: sender.email,
                    displayAmount: `-${amount}`
                },
                receiver: {
                    email: receiverEmail,
                    displayAmount: `+${amount}`
                }
            };

        } catch (error) 
        {
            await client.query('ROLLBACK');
            throw error;
        } finally 
        {
            client.release();
        }
    },

    getAll: async () => {
        const query = `
            SELECT 
                t.id AS transaction_id,
                t.amount,
                t.transaction_type,
                t.created_at,
                u_sender.email AS sender_email,
                u_receiver.email AS receiver_email
            FROM transactions t
            LEFT JOIN accounts a_sender ON t.sender_account_id = a_sender.id
            LEFT JOIN users u_sender ON a_sender.user_id = u_sender.id
            LEFT JOIN accounts a_receiver ON t.receiver_account_id = a_receiver.id
            LEFT JOIN users u_receiver ON a_receiver.user_id = u_receiver.id
            ORDER BY t.created_at DESC;
        `;
        
        const { rows } = await db.query(query);
        return rows;
    },
    getMyHistory: async (userId) => {
        const query = `
            SELECT 
                t.id AS transaction_id,
                t.amount,
                t.transaction_type,
                t.created_at,
                u_sender.email AS sender_email,
                u_receiver.email AS receiver_email,
                CASE 
                    WHEN a_sender.user_id = $1 THEN 'sent'
                    ELSE 'received'
                END AS direction
            FROM transactions t
            LEFT JOIN accounts a_sender ON t.sender_account_id = a_sender.id
            LEFT JOIN users u_sender ON a_sender.user_id = u_sender.id
            LEFT JOIN accounts a_receiver ON t.receiver_account_id = a_receiver.id
            LEFT JOIN users u_receiver ON a_receiver.user_id = u_receiver.id
            WHERE a_sender.user_id = $1 OR a_receiver.user_id = $1
            ORDER BY t.created_at DESC
            LIMIT 10; 
        `;
        
        const { rows } = await db.query(query, [userId]);
        return rows;
    }
};

module.exports = Transaction;