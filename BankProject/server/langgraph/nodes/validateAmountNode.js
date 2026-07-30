// langgraph/nodes/validateAmountNode.js

const { validateAmountTool } = require("../tools/validationTools");

const validateAmountNode = async (state) => {
  const senderId = state.user?.id;
  const amount = state.transferDetails?.amount;

  try {
    const result = await validateAmountTool(senderId, amount);

    return {
      validationStatus: {
        amountValid: result.success === true,
        amountError: result.success
          ? null
          : result.error || "Invalid transfer amount.",
      },
    };
  } catch (error) {
    console.error("Amount validation error:", error);

    return {
      validationStatus: {
        amountValid: false,
        amountError: "Could not validate the transfer amount.",
      },
    };
  }
};

module.exports = { validateAmountNode };