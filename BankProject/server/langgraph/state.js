// langgraph/state.js
const { Annotation } = require("@langchain/langgraph");

const BankState = Annotation.Root({
  messages: Annotation({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  user: Annotation(),
  intent: Annotation(),
  transferDetails: Annotation({
    reducer: (x, y) => ({ ...x, ...y }),
    default: () => ({ receiverEmail: null, amount: null }),
  }),
  validationStatus: Annotation({
    reducer: (x, y) => ({ ...x, ...y }),
    default: () => ({ emailValid: false, amountValid: false, error: null }),
  }),
  humanApproved: Annotation({
    reducer: (x, y) => (y !== undefined ? y : x),
    default: () => false,
  }),
  nextTransferAction: Annotation(),
  accountBalance: Annotation(),
  finalResponse: Annotation(),
});

module.exports = { BankState };