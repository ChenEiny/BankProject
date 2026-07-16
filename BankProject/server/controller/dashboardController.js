const Account = require('../model/accountModel'); 
const Transaction = require('../model/transactionModel');

const getDashboardData = async (req, res) => {
    try 
    {
        const userId = req.user.id; 

        const [accountDetails, recentTransactions] = await Promise.all([
            Account.getDetailsByUserId(userId),
            Transaction.getMyHistory(userId)
        ]);

        if (!accountDetails) 
        {
            return res.status(404).json({ error: "No active bank account found for this user" });
        }

        return res.status(200).json({
            message: "Dashboard data retrieved successfully",
            data: {
                account: {
                    accountId: accountDetails.account_id,
                    email: accountDetails.email,
                    phone: accountDetails.phone,
                    balance: parseFloat(accountDetails.balance)
                },
                recentTransactions: recentTransactions
            }
        });

    } catch (error) 
    {
        console.error("Dashboard Controller Error:", error.message);
        return res.status(500).json({ error: "Internal server error while loading dashboard" });
    }
};

module.exports = {
    getDashboardData
};