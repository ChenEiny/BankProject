const { model } = require("../config/llm");
const { STRICT_BANK_RULES } = require("../config/systemRules");

const formatterNode = async (state) => {
  if (state.finalResponse) {
    // במידה וה-State מוגדר עם Reducer, מספיק להחזיר רק את ההודעה החדשה
    return {
      messages: [{ role: "assistant", content: state.finalResponse }]
    };
  }

  const systemPrompt = `
${STRICT_BANK_RULES}

YOUR TASK:
Formulate a concise and clear final response to the user based on the internal system state:
- Intent: ${state.intent || "UNKNOWN"}
- Validation Status: ${JSON.stringify(state.validationStatus || {})}
- Transfer Details: ${JSON.stringify(state.transferDetails || {})}

FORMATTING INSTRUCTIONS:
- If info is missing (e.g., recipient email or amount), ask directly for it in one short sentence.
- If a transaction succeeded or failed, state the outcome clearly in 1-2 sentences.
- Do NOT output JSON. Output direct text for the end-user.
`;

  try {
    const response = await model.invoke([
      ["system", systemPrompt],
      ...state.messages
    ]);

    return {
      messages: [{ role: "assistant", content: response.content.trim() }]
    };
  } catch (error) {
    console.error("Formatter Node Error:", error);
    return {
      messages: [{ role: "assistant", content: "An error occurred while formatting the response." }]
    };
  }
};

module.exports = { formatterNode };