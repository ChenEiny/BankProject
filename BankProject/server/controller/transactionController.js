const Transaction = require('../model/transactionModel');

async function transfer(req, res)
{
    const { receiverEmail, amount } = req.body;
    
    const senderUserId = req.user.id; 

    if (!receiverEmail || amount === undefined) 
    {
        return res.status(400).json({ error: "Missing required fields: receiverEmail and amount are required" });
    }

    const transferAmount = parseFloat(amount);

    if (isNaN(transferAmount) || transferAmount <= 0) 
    {
        return res.status(400).json({ error: "Amount must be a valid number greater than 0" });
    }

    try {
        const result = await Transaction.transferMoney(senderUserId, receiverEmail, transferAmount);

        return res.status(200).json({
            message: "Transfer completed successfully",
            transaction: {
                id: result.transactionId,
                amount: result.amount,
                sender: {
                    email: result.sender.email,
                    displayAmount: result.sender.displayAmount // minus sign for the sender
                },
                receiver: {
                    email: result.receiver.email,
                    displayAmount: result.receiver.displayAmount // plus sign for the reciever
                }
            }
        });

    } catch (error) 
    {
        console.error("Transfer Error:", error.message);

        if (error.message === 'Receiver email does not exist') 
        {
            return res.status(404).json({ error: "The receiver email address does not exist" });
        }
        
        if (error.message === 'Insufficient balance') 
        {
            return res.status(400).json({ error: "Insufficient balance to perform this transfer" });
        }

        if (error.message === 'Cannot transfer money to yourself') 
        {
            return res.status(400).json({ error: "Cannot transfer money to your own account" });
        }

        return res.status(500).json({ error: "Internal server error during transaction" });
    }
}

async function getHistory(req, res) {
    try {
        const history = await Transaction.getAll();
        
        return res.status(200).json({
            message: "Transaction history retrieved successfully",
            count: history.length,
            transactions: history
        });
    } catch (error) {
        console.error("Get History Error:", error.message);
        return res.status(500).json({ error: "Internal server error while fetching history" });
    }
}

module.exports = {
    transfer,
    getHistory
};