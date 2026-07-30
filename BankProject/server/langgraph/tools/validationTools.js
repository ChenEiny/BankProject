// langgraph/tools/validationTools.js
const UserModel = require('../../model/userModel');
const Account = require('../../model/accountModel');

const validateEmailTool = async (email) => {
  if (!email || !email.includes('@')) {
    return { success: false, error: "Invalid email format." };
  }
  const recipient = await UserModel.findByEmail(email);
  if (!recipient) {
    return { success: false, error: `Recipient email "${email}" not found.` };
  }
  return { success: true, recipient };
};

const validateAmountTool = async (senderId, amount) => {
  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount <= 0.5) {
    return { success: false, error: "Amount must be greater than $0.50." };
  }

  const account = await Account.getDetailsByUserId(senderId);
  if (!account) {
    return { success: false, error: "No active account found." };
  }

  if (parseFloat(account.balance) < numAmount) {
    return {
      success: false,
      error: `Insufficient balance. Your available balance is $${account.balance}.`,
    };
  }

  return { success: true, amount: numAmount };
};

module.exports = { validateEmailTool, validateAmountTool };