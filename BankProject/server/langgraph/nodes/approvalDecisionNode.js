// langgraph/nodes/approvalDecisionNode.js

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

  if (approvedValues.has(answer)) {
    return {
      phase: "EXECUTING_TRANSFER",
      approvalDecision: "APPROVED",
      finalResponse: null,
    };
  }

  if (rejectedValues.has(answer)) {
    return {
      phase: "IDLE",
      approvalDecision: "REJECTED",
      finalResponse: "Transfer cancelled.",
    };
  }

  return {
    phase: "AWAITING_APPROVAL",
    approvalDecision: "UNKNOWN",
    finalResponse: null,
  };
};

module.exports = { approvalDecisionNode };