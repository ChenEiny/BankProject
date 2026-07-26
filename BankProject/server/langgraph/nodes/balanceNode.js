const { getBalanceTool } = require("../tools/balanceTool");

const balanceNode = async (state) => {
  const result = await getBalanceTool(state.user);

  if (result.success) {
    return {
      validationStatus: { isBalanceFetched: true },
      accountBalance: result.balance,
    };
  }

  return {
    validationStatus: { isBalanceFetched: false },
    accountBalance: null,
  };
};

module.exports = { balanceNode };