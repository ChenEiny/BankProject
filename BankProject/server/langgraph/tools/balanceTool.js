const Account = require('../../model/accountModel');

const getBalanceTool = async (user) => {
  try {
    if (!user || !user.id) {
      return { success: false, error: "User identity is missing." };
    }

    const accountDetails = await Account.getDetailsByUserId(user.id);

    if (!accountDetails) 
    {
      return { success: false, error: "No active account found." };
    }

    return {
      success: true,
      balance: accountDetails.balance
    };
  } catch (error) 
  {
    console.error("Error in getBalanceTool:", error);
    return { success: false, error: error.message };
  }
};

module.exports = { getBalanceTool };