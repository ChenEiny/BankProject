const { model } = require("../config/llm");

const recognizeIntentNode = async (state) => {
  const lastMessage = state.messages[state.messages.length - 1]?.content || "";

  const systemPrompt = `You are an intent classifier for SafeBank.
Categorize the user's request into EXACTLY ONE of the following intents:
- "BALANCE": Checking account balance or financial status.
- "TRANSFER": Requesting to transfer money to someone else.
- "NOT_RELATED": General chit-chat, non-banking questions, or irrelevant requests.

Respond ONLY with a JSON object in this format:
{"intent": "BALANCE" | "TRANSFER" | "NOT_RELATED"}`;

  try {
    const response = await model.invoke([
      { role: "system", content: systemPrompt },
      { role: "user", content: lastMessage }
    ]);

    const result = JSON.parse(response.content);
    
    if (result.intent === "NOT_RELATED") {
      return {
        intent: "NOT_RELATED",
        finalResponse: "I am SafeBank's AI financial assistant. How can I help you with your account today?"
      };
    }

    return { intent: result.intent };
  } catch (error) {
    console.error("Intent recognition error:", error);
    return { 
      intent: "NOT_RELATED", 
      finalResponse: "I was unable to understand your request. Could you please try again?" 
    };
  }
};

module.exports = { recognizeIntentNode };