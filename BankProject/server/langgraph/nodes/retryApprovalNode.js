
const { interrupt } = require("@langchain/langgraph");
const logger = require("../../config/logger").child({ module: "langgraph:retryApprovalNode" });

const retryApprovalNode = async (state) => {
  const { receiverEmail, amount } = state.transferDetails || {};

  logger.debug("Retrying human approval prompt", {
    senderEmail: state.user?.email,
    receiverEmail,
    amount,
  });

  const answer = interrupt({
    type: "TRANSFER_CONFIRMATION",
    message:
      `Sorry, I didn't understand that. Please reply YES to confirm ` +
      `or NO to cancel the transfer of $${amount} to ${receiverEmail}.`,
    transferDetails: {
      receiverEmail,
      amount,
    },
    acceptedResponses: ["YES", "NO"],
  });

  return {
    approvalResult: String(answer || "").trim(),
  };
};

module.exports = { retryApprovalNode };
