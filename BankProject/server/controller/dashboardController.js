// controller/dashboardController.js
const Account = require('../model/accountModel');
const Transaction = require('../model/transactionModel');
const { AppError } = require('../middleware/errorWrapper.js');
const logger = require('../config/logger').child({ module: 'dashboardController' });

const getDashboardData = async (req) =>
{

    const userId = req.user.id;

    const [accountDetails, recentTransactions] = await Promise.all([
        Account.getDetailsByUserId(userId),
        Transaction.getMyHistory(userId)
    ]);

    if (!accountDetails)
    {
        logger.warn("Dashboard requested for user with no active account", { userId });
        throw new AppError("No active bank account found for this user", 404);
    }

    logger.debug("Dashboard data retrieved", {
        userId,
        accountId: accountDetails.account_id,
        transactionCount: recentTransactions.length,
    });

    return {
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
    };
};

module.exports = {
    getDashboardData
};