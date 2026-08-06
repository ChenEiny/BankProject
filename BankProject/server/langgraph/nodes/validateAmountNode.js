
const { validateAmountTool } = require("../tools/validationTools");
const logger = require("../../config/logger").child({ module: "langgraph:validateAmountNode" });

const validateAmountNode = async (state) => {
  const senderId = state.user?.id;
  const amount = state.transferDetails?.amount;

  try {
    const result = await validateAmountTool(senderId, amount);

    logger.debug("Amount validated", { amount, amountValid: result.success === true });

    return {
      validationStatus: {
        amountValid: result.success === true,
        amountError: result.success
          ? null
          : result.error || "Invalid transfer amount.",
      },
    };
  } catch (error) {
    logger.error("Amount validation error", { error: error.message });

    return {
      validationStatus: {
        amountValid: false,
        amountError: "Could not validate the transfer amount.",
      },
    };
  }
};

module.exports = { validateAmountNode };