const Transaction = require('../../model/transactionModel');
const { sendNotification } = require('../../socket');

const executeTransferTool = async (senderUser, receiverEmail, amount) => {
  try {
    if (!senderUser || !senderUser.id) {
      return { success: false, error: "Sender authentication details missing." };
    }

    const transferAmount = Number(amount);
    if (isNaN(transferAmount) || transferAmount <= 0.5) {
      return { success: false, error: "Transfer amount must be greater than $0.50." };
    }

    const result = await Transaction.transferMoney(senderUser.id, receiverEmail, transferAmount);

    if (result.receiver && result.receiver.email) {
      sendNotification(result.receiver.email, 'TRANSFER_RECEIVED', {
        transactionId: result.transactionId,
        amount: result.amount,
        senderEmail: result.sender.email,
        timestamp: new Date().toISOString()
      });
    }

    return {
      success: true,
      transaction: {
        id: result.transactionId,
        amount: result.amount,
        senderEmail: result.sender.email,
        receiverEmail: result.receiver.email
      }
    };
  } catch (error) {
    // החזרת הודעות שגיאה קריאות עבור ה-State/Formatter
    return { 
      success: false, 
      error: error.message 
    };
  }
};

module.exports = { executeTransferTool };