// langgraph/nodes/validateCompleteNode.js
const { validateEmailTool, validateAmountTool } = require("../tools/validationTools");

const validateCompleteNode = async (state) => {
  const { receiverEmail, amount } = state.transferDetails || {};

  const emailRes = await validateEmailTool(receiverEmail);
  const amountRes = await validateAmountTool(state.user?.id, amount);

  const emailValid = Boolean(emailRes?.success && emailRes?.recipient);
  const amountValid = Boolean(amountRes?.success);

  let errorMessage = null;
  if (!emailValid) {
    errorMessage = emailRes?.error || `Recipient email ${receiverEmail} does not exist in SafeBank system.`;
  } else if (!amountValid) {
    errorMessage = amountRes?.error || `Insufficient funds for transferring $${amount}.`;
  }

  return {
    validationStatus: {
      emailValid,
      amountValid,
      error: errorMessage
    },
    finalResponse: errorMessage ? `Validation Error: ${errorMessage}` : null
  };
};

module.exports = { validateCompleteNode };