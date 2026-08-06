// langgraph/bankGraph.js

const {StateGraph,START,END,MemorySaver,} = require("@langchain/langgraph");

const { BankState } = require("./state");

const { sanitizerNode } = require("./nodes/sanitizerNode");
const {recognizeIntentNode,} = require("./nodes/recognizeIntentNode");

const {extractTransferDetailsNode,} = require("./nodes/extractTransferDetailsNode");

const {checkMissingDetailsNode,} = require("./nodes/checkMissingDetailsNode");

const {askMissingInfoNode,} = require("./nodes/askMissingInfoNode");

const {validateEmailNode,} = require("./nodes/validateEmailNode");

const {validateAmountNode,} = require("./nodes/validateAmountNode");

const {validationResultNode,} = require("./nodes/validationResultNode");

const {humanApprovalNode,} = require("./nodes/humanApprovalNode");

const {approvalDecisionNode,} = require("./nodes/approvalDecisionNode");

const {retryApprovalNode,} = require("./nodes/retryApprovalNode");

const {executeTransferNode,} = require("./nodes/executeTransferNode");

const { balanceNode } = require("./nodes/balanceNode");
const { formatterNode } = require("./nodes/formatterNode");

const logger = require("../config/logger").child({ module: "bankGraph" });

/*
 * Wraps every node so the flow through the graph is visible in the log:
 * when a node starts, when it finishes (and how long it took), or if it throws.
 */
const withFlowLogging = (name, node) => async (state, config) => {
  logger.debug(`Node started: ${name}`);
  const start = Date.now();

  try {
    const result = await node(state, config);
    logger.debug(`Node finished: ${name}`, { durationMs: Date.now() - start });
    return result;
  } catch (error) {
    logger.error(`Node threw: ${name}`, {
      durationMs: Date.now() - start,
      error: error.message,
    });
    throw error;
  }
};

// ---------- Routers ----------

const routeAfterSanitizer = (state) => {
  if (state.finalResponse || state.intent === "MALICIOUS") {
    return "formatterNode";
  }

  /*
   * המשתמש כבר נמצא באמצע איסוף פרטי העברה.
   * לכן הודעה כמו "20" או "test@email.com"
   * לא צריכה לעבור Intent Recognition.
   */
  if (state.phase === "COLLECTING_TRANSFER") {
    return "extractTransferDetailsNode";
  }

  return "recognizeIntentNode";
};

const routeIntent = (state) => {
  switch (state.intent) {
    case "BALANCE":
      return "balanceNode";

    case "TRANSFER":
      return "extractTransferDetailsNode";

    default:
      return "formatterNode";
  }
};

const routeMissingDetails = (state) => {
  return state.missingField
    ? "askMissingInfoNode"
    : "validateEmailNode";
};

const routeValidationResult = (state) => {
  const { emailValid, amountValid } =
    state.validationStatus || {};

  return emailValid && amountValid
    ? "humanApprovalNode"
    : "formatterNode";
};

const routeApproval = (state) => {
  switch (state.approvalDecision) {
    case "APPROVED":
      return "executeTransferNode";

    case "REJECTED":
      return "formatterNode";

    default:
      return "retryApprovalNode";
  }
};

// ---------- Graph ----------

const withNode = (name, node) => withFlowLogging(name, node);

const workflow = new StateGraph(BankState)
  .addNode("sanitizerNode", withNode("sanitizerNode", sanitizerNode))
  .addNode("recognizeIntentNode", withNode("recognizeIntentNode", recognizeIntentNode))
  .addNode("extractTransferDetailsNode", withNode("extractTransferDetailsNode", extractTransferDetailsNode))
  .addNode("checkMissingDetailsNode", withNode("checkMissingDetailsNode", checkMissingDetailsNode))
  .addNode("askMissingInfoNode", withNode("askMissingInfoNode", askMissingInfoNode))
  .addNode("validateEmailNode", withNode("validateEmailNode", validateEmailNode))
  .addNode("validateAmountNode", withNode("validateAmountNode", validateAmountNode))
  .addNode("validationResultNode", withNode("validationResultNode", validationResultNode))

  .addNode("humanApprovalNode", withNode("humanApprovalNode", humanApprovalNode))
  .addNode("approvalDecisionNode", withNode("approvalDecisionNode", approvalDecisionNode))
  .addNode("retryApprovalNode", withNode("retryApprovalNode", retryApprovalNode))

  .addNode("executeTransferNode", withNode("executeTransferNode", executeTransferNode))
  .addNode("balanceNode", withNode("balanceNode", balanceNode))
  .addNode("formatterNode", withNode("formatterNode", formatterNode))

  .addEdge(START, "sanitizerNode")

  .addConditionalEdges("sanitizerNode",routeAfterSanitizer)

  .addConditionalEdges("recognizeIntentNode",routeIntent)

  .addEdge("extractTransferDetailsNode","checkMissingDetailsNode")

  .addConditionalEdges("checkMissingDetailsNode",routeMissingDetails)

  .addEdge("askMissingInfoNode", "formatterNode")

  .addEdge("validateEmailNode", "validateAmountNode")
  .addEdge("validateAmountNode", "validationResultNode")

  .addConditionalEdges("validationResultNode",routeValidationResult)

  /*
   * humanApprovalNode נעצר ב-interrupt.
   * לאחר resume הוא ממשיך ל-approvalDecisionNode.
   */
  .addEdge("humanApprovalNode", "approvalDecisionNode")
  .addConditionalEdges("approvalDecisionNode",routeApproval)

  .addEdge("retryApprovalNode", "approvalDecisionNode")

  .addEdge("executeTransferNode", "formatterNode")
  .addEdge("balanceNode", "formatterNode")

  .addEdge("formatterNode", END);

const checkpointer = new MemorySaver();

const bankGraph = workflow.compile({
  checkpointer,
});

module.exports = { bankGraph };