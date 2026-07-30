// langgraph/nodes/validateEmailNode.js

const { validateEmailTool } = require("../tools/validationTools");

const validateEmailNode = async (state) => {
  const email = state.transferDetails?.receiverEmail;

  try {
    const result = await validateEmailTool(email);

    return {
      validationStatus: {
        emailValid: result.success === true,
        emailError: result.success
          ? null
          : result.error || "Invalid recipient email.",
      },
    };
  } catch (error) {
    console.error("Email validation error:", error);

    return {
      validationStatus: {
        emailValid: false,
        emailError: "Could not validate the recipient email.",
      },
    };
  }
};

module.exports = { validateEmailNode };