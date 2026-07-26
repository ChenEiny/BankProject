const { StateGraph, END, START } = require("@langchain/langgraph");
const { BankState } = require("./state");
const { sanitizerNode } = require("./nodes/sanitizerNode");
const { recognizeIntentNode } = require("./nodes/recognizeIntentNode");
const { balanceNode } = require("./nodes/balanceNode");
const { formatterNode } = require("./nodes/formatterNode");

const workflow = new StateGraph(BankState)
  .addNode("sanitizer", sanitizerNode)
  .addNode("recognizeIntent", recognizeIntentNode)
  .addNode("balanceNode", balanceNode)
  .addNode("formatter", formatterNode);

// START -> Sanitizer
workflow.addEdge(START, "sanitizer");

// Sanitizer Routing
workflow.addConditionalEdges("sanitizer", (state) => {
  if (state.intent === "MALICIOUS") {
    return END;
  }
  return "recognizeIntent";
});

// Recognize Intent Routing
workflow.addConditionalEdges("recognizeIntent", (state) => {
  if (state.intent === "NOT_RELATED") {
    return END;
  }
  if (state.intent === "BALANCE") {
    return "balanceNode";
  }
  // בעתיד נוסיף את ה-TRANSFER
  return "formatter";
});

// BalanceNode -> Formatter -> END
workflow.addEdge("balanceNode", "formatter");
workflow.addEdge("formatter", END);

const bankGraph = workflow.compile();

module.exports = { bankGraph };