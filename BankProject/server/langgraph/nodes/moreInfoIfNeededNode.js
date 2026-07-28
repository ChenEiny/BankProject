// langgraph/nodes/moreInfoIfNeededNode.js
const { model } = require("../config/llm");

const moreInfoIfNeededNode = async (state) => {
  const systemPrompt = `You are an AI data extraction node for a banking graph.
Analyze the conversation context and extract details needed for a money transfer.
Existing Details: ${JSON.stringify(state.transferDetails || {})}

Extract/Update:
- receiverEmail (string or null)
- amount (number or null)

Respond STRICTLY in JSON format:
{
  "receiverEmail": "extracted_email_or_existing",
  "amount": extracted_number_or_existing
}`;

  try {
    const response = await model.invoke([
      ["system", systemPrompt],
      ...state.messages
    ]);

    const result = JSON.parse(response.content.replace(/```json|```/g, "").trim());

    return {
      transferDetails: {
        receiverEmail: result.receiverEmail || state.transferDetails?.receiverEmail || null,
        amount: result.amount ? Number(result.amount) : (state.transferDetails?.amount || null)
      }
    };
  } catch (error) {
    console.error("Error in moreInfoIfNeededNode:", error);
    return {};
  }
};

module.exports = { moreInfoIfNeededNode };