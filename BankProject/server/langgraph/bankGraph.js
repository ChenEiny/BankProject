// langgraph/bankGraph.js
const { StateGraph, END, START } = require("@langchain/langgraph");
const { BankState } = require("./state");

const { sanitizerNode } = require("./nodes/sanitizerNode");
const { recognizeIntentNode } = require("./nodes/recognizeIntentNode");
const { balanceNode } = require("./nodes/balanceNode");
const { formatterNode } = require("./nodes/formatterNode");

const { transferNode } = require("./nodes/transferNode");
const { moreInfoIfNeededNode } = require("./nodes/moreInfoIfNeededNode");
const { validateCompleteNode } = require("./nodes/validateCompleteNode");
const { humanApproveNode } = require("./nodes/humanApproveNode");
const { executeTransferNode } = require("./nodes/executeTransferNode");

// ROUTERS
const routeIntent = (state) => {
  if (state.finalResponse) return "formatterNode";
  switch (state.intent) {
    case "BALANCE": return "balanceNode";
    case "TRANSFER": return "transferNode";
    default: return "formatterNode";
  }
};

const routeTransferAction = (state) => {
  switch (state.nextTransferAction) {
    case "GET_MORE_INFO": return "moreInfoIfNeededNode";
    case "VALIDATE": return "validateCompleteNode";
    case "APPROVE": return "humanApproveNode";
    case "EXECUTE": return "executeTransferNode";
    default: return "formatterNode";
  }
};

const routeAfterMoreInfo = (state) => {
  if (!state.transferDetails?.receiverEmail || !state.transferDetails?.amount) {
    return "formatterNode";
  }
  return "validateCompleteNode";
};

const routeAfterValidation = (state) => {
  if (state.finalResponse || !state.validationStatus?.emailValid || !state.validationStatus?.amountValid) {
    return "formatterNode";
  }
  return "humanApproveNode";
};

const routeAfterApprove = (state) => {
  if (!state.humanApproved) {
    return "formatterNode";
  }
  return "executeTransferNode";
};

// BUILD GRAPH
const workflow = new StateGraph(BankState)
  .addNode("sanitizerNode", sanitizerNode)
  .addNode("recognizeIntentNode", recognizeIntentNode)
  .addNode("balanceNode", balanceNode)
  .addNode("transferNode", transferNode)
  .addNode("moreInfoIfNeededNode", moreInfoIfNeededNode)
  .addNode("validateCompleteNode", validateCompleteNode)
  .addNode("humanApproveNode", humanApproveNode)
  .addNode("executeTransferNode", executeTransferNode)
  .addNode("formatterNode", formatterNode)

  .addEdge(START, "sanitizerNode")
  .addEdge("sanitizerNode", "recognizeIntentNode")
  .addConditionalEdges("recognizeIntentNode", routeIntent)

  // Transfer Flow
  .addConditionalEdges("transferNode", routeTransferAction)
  .addConditionalEdges("moreInfoIfNeededNode", routeAfterMoreInfo)
  .addConditionalEdges("validateCompleteNode", routeAfterValidation)
  .addConditionalEdges("humanApproveNode", routeAfterApprove)
  
  .addEdge("executeTransferNode", "formatterNode")
  .addEdge("balanceNode", "formatterNode")
  .addEdge("formatterNode", END);

const bankGraph = workflow.compile();
module.exports = { bankGraph };