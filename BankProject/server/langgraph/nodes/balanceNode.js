// langgraph/nodes/balanceNode.js

const { getBalanceTool } = require("../tools/balanceTool");

const balanceNode = async (state) => {
  try {
    const result = await getBalanceTool(state.user);

    return {
      balanceResult: result,
    };
  } catch (error) {
    console.error("Balance retrieval error:", error);

    return {
      balanceResult: {
        success: false,
        error: "Could not retrieve your balance.",
      },
    };
  }
};

module.exports = { balanceNode };
