// langgraph/nodes/transferNode.js

const transferNode = async (state) => {
  const { receiverEmail, amount } = state.transferDetails || {};
  const { emailValid, amountValid } = state.validationStatus || {};

  if (!receiverEmail || !amount) {
    return { nextTransferAction: "GET_MORE_INFO" };
  }

  if (!emailValid || !amountValid) {
    return { nextTransferAction: "VALIDATE" };
  }

  if (!state.humanApproved) {
    return { nextTransferAction: "APPROVE" };
  }

  return { nextTransferAction: "EXECUTE" };
};

module.exports = { transferNode };