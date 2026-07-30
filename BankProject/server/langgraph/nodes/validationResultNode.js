// langgraph/nodes/validationResultNode.js

const validationResultNode = async (state) => {
  const validation = state.validationStatus || {};

  if (validation.emailValid && validation.amountValid) {
    return {
      phase: "AWAITING_APPROVAL",
      finalResponse: null,
    };
  }

  const errors = [
    validation.emailError,
    validation.amountError,
  ].filter(Boolean);

  return {
    phase: "COLLECTING_TRANSFER",
    finalResponse:
      errors.join(" ") ||
      "The transfer details could not be validated.",
  };
};

module.exports = { validationResultNode };