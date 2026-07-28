// langgraph/tools/validationTools.js
const UserModel = require('../../model/userModel');

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
  return { success: true, amount: numAmount };
};

module.exports = { validateEmailTool, validateAmountTool };