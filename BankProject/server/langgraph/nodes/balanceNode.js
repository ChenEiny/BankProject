
const { getBalanceTool } = require("../tools/balanceTool");
const logger = require("../../config/logger").child({ module: "langgraph:balanceNode" });

const balanceNode = async (state) => {
  try {
    const result = await getBalanceTool(state.user);

    logger.debug("Balance retrieved", {
      userEmail: state.user?.email,
      success: result.success,
    });

    return {
      balanceResult: result,
    };
  } catch (error) {
    logger.error("Balance retrieval error", { error: error.message });

    return {
      balanceResult: {
        success: false,
        error: "Could not retrieve your balance.",
      },
    };
  }
};

module.exports = { balanceNode };
