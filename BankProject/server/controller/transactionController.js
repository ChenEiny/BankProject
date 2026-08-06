const Transaction = require('../model/transactionModel');
const { AppError } = require('../middleware/errorWrapper.js');
const { sendNotification } = require('../socket');
const logger = require('../config/logger').child({ module: 'transactionController' });


async function transfer(req) 
{ 
    const { receiverEmail, amount } = req.body;
    const senderUserId = req.user.id; 

    if (!receiverEmail || amount === undefined || amount === null) 
    {
        throw new AppError("Missing required fields: receiverEmail and amount are required", 400);
    }

    if (typeof amount === 'object' || Array.isArray(amount) || typeof amount === 'boolean') 
    {
        throw new AppError("Amount must be a valid number, not an array or object", 400);
    }

    const transferAmount = Number(amount);

    if (isNaN(transferAmount) || transferAmount <= 0 || transferAmount <= 0.5) 
    {
        throw new AppError("Amount must be a valid number greater than 0", 400);
    }

    try {
        const result = await Transaction.transferMoney(senderUserId, receiverEmail, transferAmount);

        if (result.receiver && result.receiver.email)
        {
            sendNotification(result.receiver.email, 'TRANSFER_RECEIVED', {
                transactionId: result.transactionId,
                amount: result.amount,
                senderEmail: result.sender.email,
                timestamp: new Date().toISOString()
            });
        }

        logger.info("Transfer success", {
            senderEmail: result.sender.email,
            receiverEmail: result.receiver.email,
            amount: result.amount,
            transactionId: result.transactionId,
        });

        return {
            message: "Transfer completed successfully",
            transaction: {
                id: result.transactionId,
                amount: result.amount,
                sender: {
                    email: result.sender.email,
                    displayAmount: result.sender.displayAmount
                },
                receiver: {
                    email: result.receiver.email,
                    displayAmount: result.receiver.displayAmount
                }
            }
        };
    } catch (error) {
        logger.warn("Transfer rejected", {
            senderUserId: senderUserId,
            receiverEmail,
            amount: transferAmount,
            reason: error.message,
        });

        if (error.message === 'Receiver email does not exist')
        {
            throw new AppError("The receiver email address does not exist", 404);
        }
        if (error.message === 'Insufficient balance')
        {
            throw new AppError("Insufficient balance to perform this transfer", 400);
        }
        if (error.message === 'Cannot transfer money to yourself')
        {
            throw new AppError("Cannot transfer money to your own account", 400);
        }

        throw error;
    }
}

async function getHistory(req) {
    const history = await Transaction.getMyHistory(req.user.id);

    logger.debug("Transaction history retrieved", {
        userId: req.user.id,
        count: history.length,
    });

    return {
        message: "Transaction history retrieved successfully",
        count: history.length,
        transactions: history
    };
}

module.exports = {
    transfer,
    getHistory
};