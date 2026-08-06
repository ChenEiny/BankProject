
const logger = require("../../config/logger").child({ module: "langgraph:validationResultNode" });

const validationResultNode = async (state) => {
  const validation = state.validationStatus || {};

  if (validation.emailValid && validation.amountValid) {
    logger.debug("Transfer details valid, awaiting approval");

    return {
      phase: "AWAITING_APPROVAL",
      finalResponse: null,
    };
  }

  const errors = [
    validation.emailError,
    validation.amountError,
  ].filter(Boolean);

  logger.debug("Transfer details invalid", { errors });

  return {
    phase: "COLLECTING_TRANSFER",
    finalResponse:
      errors.join(" ") ||
      "The transfer details could not be validated.",
  };
};

module.exports = { validationResultNode };