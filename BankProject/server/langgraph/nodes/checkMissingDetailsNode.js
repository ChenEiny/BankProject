
const logger = require("../../config/logger").child({ module: "langgraph:checkMissingDetailsNode" });

const checkMissingDetailsNode = async (state) => {
  const { receiverEmail, amount } = state.transferDetails || {};

  let missingField = null;

  if (!receiverEmail && amount == null) {
    missingField = "EMAIL_AND_AMOUNT";
  } else if (!receiverEmail) {
    missingField = "EMAIL";
  } else if (amount == null) {
    missingField = "AMOUNT";
  }

  logger.debug("Missing details check", { missingField });

  return {
    missingField,
  };
};

module.exports = { checkMissingDetailsNode };