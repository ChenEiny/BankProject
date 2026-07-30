// langgraph/nodes/executeTransferNode.js

const { executeTransferTool } = require("../tools/transferTool");

const executeTransferNode = async (state) => {
  const { receiverEmail, amount } = state.transferDetails || {};

  try {
    const result = await executeTransferTool(
      state.user,
      receiverEmail,
      amount
    );

    return {
      transferResult: result,
    };
  } catch (error) {
    console.error("Transfer execution error:", error);

    return {
      transferResult: {
        success: false,
        error: "The transfer could not be completed.",
      },
    };
  }
};

module.exports = { executeTransferNode };
