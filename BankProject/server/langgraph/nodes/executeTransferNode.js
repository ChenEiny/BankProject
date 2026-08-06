
const {executeTransferTool,} = require("../tools/transferTool");
const logger = require("../../config/logger").child({ module: "langgraph:executeTransferNode" });

const executeTransferNode = async (state) => {
  const { receiverEmail, amount } = state.transferDetails;

  try {
    const result = await executeTransferTool(
      state.user,
      receiverEmail,
      amount
    );

    if (!result.success) {
      logger.warn("Transfer failed", {
        senderEmail: state.user?.email,
        receiverEmail,
        amount,
        error: result.error,
      });

      return {
        phase: "IDLE",
        transferResult: {
          success: false,
          error: result.error || "Transfer failed.",
        },
      };
    }

    logger.info("Transfer success", {
      senderEmail: state.user?.email,
      receiverEmail,
      amount,
      transactionId: result.transaction?.id,
    });

    return {
      phase: "IDLE",
      transferResult: {
        success: true,
        transaction: result.transaction,
      },
    };
  } catch (error) {
    logger.error("Execute transfer node error", {
      senderEmail: state.user?.email,
      receiverEmail,
      amount,
      error: error.message,
    });

    return {
      phase: "IDLE",
      transferResult: {
        success: false,
        error:
          "An unexpected error occurred while executing the transfer.",
      },
    };
  }
};

module.exports = { executeTransferNode };