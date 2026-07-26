const { Annotation } = require("@langchain/langgraph");

const BankState = Annotation.Root({
  messages: Annotation({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  user: Annotation(),
  intent: Annotation(),
  transferDetails: Annotation(),
  validationStatus: Annotation(),
  accountBalance: Annotation(), 
  finalResponse: Annotation(),
});

module.exports = { BankState };