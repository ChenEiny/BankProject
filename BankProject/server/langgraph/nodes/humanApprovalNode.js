// langgraph/nodes/humanApprovalNode.js

const { interrupt } = require("@langchain/langgraph");

const humanApprovalNode = async (state) => {
  const { receiverEmail, amount } = state.transferDetails;

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