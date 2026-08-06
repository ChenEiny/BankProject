
const logger = require("../../config/logger").child({ module: "langgraph:approvalDecisionNode" });

const approvalDecisionNode = async (state) => {
  const answer = String(state.approvalResult || "")
    .trim()
    .toLowerCase();

  const approvedValues = new Set([
    "yes",
    "y",
    "confirm",
    "confirmed",
    "approve",
    "approved",
    "ok",
    "כן",
    "מאשר",
  ]);

  const rejectedValues = new Set([
    "no",
    "n",
    "cancel",
    "reject",
    "stop",
    "לא",
    "מבטל",
  ]);

  const { receiverEmail, amount } = state.transferDetails || {};

  if (approvedValues.has(answer)) {
    logger.info("Transfer approval decision", {
      senderEmail: state.user?.email,
      receiverEmail,
      amount,
      decision: "APPROVED",
    });

    return {
      phase: "EXECUTING_TRANSFER",
      approvalDecision: "APPROVED",
      finalResponse: null,
    };
  }

  if (rejectedValues.has(answer)) {
    logger.info("Transfer approval decision", {
      senderEmail: state.user?.email,
      receiverEmail,
      amount,
      decision: "REJECTED",
    });

    return {
      phase: "IDLE",
      approvalDecision: "REJECTED",
      finalResponse: "Transfer cancelled.",
    };
  }

  logger.debug("Transfer approval decision unclear", {
    senderEmail: state.user?.email,
    receiverEmail,
    amount,
    answer,
  });

  return {
    phase: "AWAITING_APPROVAL",
    approvalDecision: "UNKNOWN",
    finalResponse: null,
  };
};

module.exports = { approvalDecisionNode };