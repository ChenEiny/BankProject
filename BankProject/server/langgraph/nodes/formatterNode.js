
const logger = require("../../config/logger").child({ module: "langgraph:formatterNode" });

const formatterNode = async (state) => {
  let responseText = state.finalResponse;

  if (!responseText && state.balanceResult) {
    responseText = state.balanceResult.success
      ? `Your current balance is $${state.balanceResult.balance}.`
      : state.balanceResult.error || "Could not retrieve your balance.";
  }

  if (!responseText && state.transferResult) {
    if (state.transferResult.success) {
      const transaction = state.transferResult.transaction;

      responseText =
        `Successfully transferred $${transaction.amount} ` +
        `to ${transaction.receiverEmail}. ` +
        `Transaction ID: ${transaction.id}.`;
    } else {
      responseText =
        state.transferResult.error || "The transfer failed.";
    }
  }

  if (!responseText && state.intent === "NOT_RELATED") {
    responseText =
      "I can only assist with SafeBank balance checks and transfers.";
  }

  responseText ||= "The request could not be completed.";

  logger.debug("Final response formatted", { responseLength: responseText.length });

  return {
    messages: [
      {
        role: "assistant",
        content: responseText,
      },
    ],

    /*
     * מנקים state של פעולה שהסתיימה.
     * לא מוחקים את messages.
     */
    phase:
      state.phase === "COLLECTING_TRANSFER"
        ? "COLLECTING_TRANSFER"
        : "IDLE",

    finalResponse: null,

    ...(state.phase !== "COLLECTING_TRANSFER"
      ? {
          intent: null,
          transferDetails: {
            receiverEmail: null,
            amount: null,
          },
          validationStatus: {
            emailValid: false,
            amountValid: false,
            emailError: null,
            amountError: null,
          },
          approvalResult: null,
          approvalDecision: null,
          transferResult: null,
          balanceResult: null,
          missingField: null,
        }
      : {}),
  };
};

module.exports = { formatterNode };