// langgraph/state.js

const { Annotation } = require("@langchain/langgraph");

const overwrite = (_current, update) => update;

const BankState = Annotation.Root({
  messages: Annotation({
    reducer: (current, update) => current.concat(update),
    default: () => [],
  }),

  user: Annotation({
    reducer: overwrite,
    default: () => null,
  }),

  phase: Annotation({
    reducer: overwrite,
    default: () => "IDLE",
  }),

  intent: Annotation({
    reducer: overwrite,
    default: () => null,
  }),

  transferDetails: Annotation({
    reducer: (current, update) => ({
      ...current,
      ...update,
    }),
    default: () => ({
      receiverEmail: null,
      amount: null,
    }),
  }),

  validationStatus: Annotation({
    reducer: (current, update) => ({
      ...current,
      ...update,
    }),
    default: () => ({
      emailValid: false,
      amountValid: false,
      emailError: null,
      amountError: null,
    }),
  }),

  approvalResult: Annotation({
    reducer: overwrite,
    default: () => null,
  }),

  balanceResult: Annotation({
    reducer: overwrite,
    default: () => null,
  }),

  transferResult: Annotation({
    reducer: overwrite,
    default: () => null,
  }),

  finalResponse: Annotation({
    reducer: overwrite,
    default: () => null,
  }),
  missingField: Annotation({
  reducer: overwrite,
  default: () => null,
  }),
  approvalDecision: Annotation({
  reducer: overwrite,
  default: () => null,
  }),
});

module.exports = { BankState };