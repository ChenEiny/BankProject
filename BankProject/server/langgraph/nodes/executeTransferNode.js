// langgraph/nodes/executeTransferNode.js
const { executeTransferTool } = require("../tools/transferTool");

const executeTransferNode = async (state) => {
  const { receiverEmail, amount } = state.transferDetails || {};

  const result = await executeTransferTool(state.user, receiverEmail, amount);

  if (result.success) {
    return {
      validationStatus: {
        ...state.validationStatus,
        isTransferSuccessful: true,
        transaction: result.transaction,
        error: null
      },
      finalResponse: `Successfully transferred $${amount} to ${receiverEmail}. Transaction ID: ${result.transaction?.id}`
    };
  }

  return {
    validationStatus: {
      ...state.validationStatus,
      isTransferSuccessful: false,
      error: result.error || "Transfer execution failed."
    },
    finalResponse: `Transfer failed: ${result.error || "Transaction error"}`
  };
};

module.exports = { executeTransferNode };