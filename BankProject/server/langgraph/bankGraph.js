const { StateGraph, END, START } = require("@langchain/langgraph");
const { BankState } = require("./state");

const { sanitizerNode } = require("./nodes/sanitizerNode");
const { recognizeIntentNode } = require("./nodes/recognizeIntentNode");
const { balanceNode } = require("./nodes/balanceNode");
const { transferNode } = require("./nodes/transferNode");
const { formatterNode } = require("./nodes/formatterNode");

// פונקציית ניווט לפי ה-Intent שהתגלה
const routeIntent = (state) => {
  if (state.finalResponse) return END; // חסימת ספאם/סניטציה

  switch (state.intent) {
    case "BALANCE":
      return "balanceNode";
    case "TRANSFER":
      return "transferNode";
    default:
      return "formatterNode";
  }
};

const workflow = new StateGraph(BankState)
  .addNode("sanitizerNode", sanitizerNode)
  .addNode("recognizeIntentNode", recognizeIntentNode)
  .addNode("balanceNode", balanceNode)
  .addNode("transferNode", transferNode)
  .addNode("formatterNode", formatterNode)

  .addEdge(START, "sanitizerNode")
  .addEdge("sanitizerNode", "recognizeIntentNode")
  .addConditionalEdges("recognizeIntentNode", routeIntent)
  .addEdge("balanceNode", "formatterNode")
  .addEdge("transferNode", "formatterNode")
  .addEdge("formatterNode", END);

const bankGraph = workflow.compile();

module.exports = { bankGraph };