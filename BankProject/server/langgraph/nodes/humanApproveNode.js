// langgraph/nodes/humanApproveNode.js
const { model } = require("../config/llm");

const humanApproveNode = async (state) => {
  const lastUserMessage = state.messages[state.messages.length - 1]?.content || "";

  const systemPrompt = `Analyze the user's latest response to a transfer confirmation prompt.
Transfer Details: $${state.transferDetails?.amount} to ${state.transferDetails?.receiverEmail}.

User message: "${lastUserMessage}"

Did the user explicitly AGREE / CONFIRM the transaction? 
Respond STRICTLY in JSON format:
{
  "approved": boolean,
  "rejected": boolean
}`;

  try {
    const response = await model.invoke([["system", systemPrompt]]);
    const result = JSON.parse(response.content.replace(/```json|```/g, "").trim());

    if (result.approved) {
      return { humanApproved: true, finalResponse: null };
    }

    if (result.rejected) {
      return {
        humanApproved: false,
        finalResponse: "Transfer cancelled by user."
      };
    }

    return {
      humanApproved: false,
      finalResponse: `Please confirm: Do you want to transfer $${state.transferDetails?.amount} to ${state.transferDetails?.receiverEmail}? Reply YES to confirm or NO to cancel.`
    };
  } catch (error) {
    return {
      humanApproved: false,
      finalResponse: `Please confirm: Do you want to transfer $${state.transferDetails?.amount} to ${state.transferDetails?.receiverEmail}? (Yes/No)`
    };
  }
};

module.exports = { humanApproveNode };