const { model } = require("../config/llm");

const formatterNode = async (state) => {
  // אם כבר יש finalResponse מוכן (למשל מ-sanitizer או error), נחזיר אותו
  if (state.finalResponse) {
    return {};
  }

  const userName = state.user?.email || "Customer";
  
  const systemPrompt = `You are SafeBank's professional AI assistant. 
  Format a helpful and polite response for ${userName} based on the intent and status.
  
  Current Intent: ${state.intent}
  Validation/Data Status: ${JSON.stringify(state.validationStatus || {})}
  Account Balance: ${state.accountBalance || "N/A"}`;

  const response = await model.invoke([
    { role: "system", content: systemPrompt },
    ...state.messages
  ]);

  return {
    finalResponse: response.content
  };
};

module.exports = { formatterNode };