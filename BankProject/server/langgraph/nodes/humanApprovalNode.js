
const { interrupt } = require("@langchain/langgraph");
const logger = require("../../config/logger").child({ module: "langgraph:humanApprovalNode" });

const humanApprovalNode = async (state) => {
  const { receiverEmail, amount } = state.transferDetails;

  logger.info("Human approval requested", {
    senderEmail: state.user?.email,
    receiverEmail,
    amount,
  });

  const answer = interrupt({
    type: "TRANSFER_CONFIRMATION",
    message:
      `Please confirm: transfer $${amount} to ${receiverEmail}?`,
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

module.exports = { humanApprovalNode };