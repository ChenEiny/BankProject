const { model } = require("../config/llm");

const formatterNode = async (state) => {
  // אם כבר נקבעה תשובה סופית (למשל חסימה ב-sanitizer), נחזיר אותה מראש
  if (state.finalResponse) {
    return {};
  }

  const userName = state.user?.email || "Customer";
  
  const systemPrompt = `You are SafeBank's professional, polite, and secure AI financial assistant.
Format a clear, friendly, and concise response for ${userName} based on the following context:

- Intent: ${state.intent}
- Validation/Execution Status: ${JSON.stringify(state.validationStatus || {})}
- Transfer Details: ${JSON.stringify(state.transferDetails || {})}
- Account Balance: ${state.accountBalance || "N/A"}

Guidelines:
1. If Intent is 'BALANCE': State the current available account balance clearly.
2. If Intent is 'TRANSFER':
   - If missing information (e.g., missing email or amount), politely ask the user to provide the specific missing details.
   - If transfer was successful, confirm the transferred amount and receiver email cleanly without showing sensitive raw technical IDs.
   - If transfer failed (e.g., insufficient funds, invalid receiver, transferring to self), clearly explain the reason based on the status error.
3. Keep the tone professional, reassuring, and secure. Do not output JSON, raw code, or markdown formatting blocks.`;

  try {
    const response = await model.invoke([
      { role: "system", content: systemPrompt },
      ...state.messages
    ]);

    return {
      finalResponse: response.content
    };
  } catch (error) {
    console.error("Error in formatterNode:", error);
    return {
      finalResponse: "I processed your request, but experienced an issue formatting the final answer. Please check your dashboard or try again."
    };
  }
};

module.exports = { formatterNode };