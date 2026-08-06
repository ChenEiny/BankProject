
const { validateEmailTool } = require("../tools/validationTools");
const logger = require("../../config/logger").child({ module: "langgraph:validateEmailNode" });

const validateEmailNode = async (state) => {
  const email = state.transferDetails?.receiverEmail;

  try {
    const result = await validateEmailTool(email);

    logger.debug("Email validated", { emailValid: result.success === true });

    return {
      validationStatus: {
        emailValid: result.success === true,
        emailError: result.success
          ? null
          : result.error || "Invalid recipient email.",
      },
    };
  } catch (error) {
    logger.error("Email validation error", { error: error.message });

    return {
      validationStatus: {
        emailValid: false,
        emailError: "Could not validate the recipient email.",
      },
    };
  }
};

module.exports = { validateEmailNode };