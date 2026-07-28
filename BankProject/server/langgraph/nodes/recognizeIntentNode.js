const { model } = require("../config/llm");
const { STRICT_BANK_RULES } = require("../config/systemRules");

const recognizeIntentNode = async (state) => {
  const lastMessage = state.messages[state.messages.length - 1]?.content || "";

  if (state.intent === "TRANSFER" && lastMessage.includes("@")) {
    return { intent: "TRANSFER" };
  }

  const systemPrompt = `
${STRICT_BANK_RULES}

INTENT CLASSIFICATION TASK:
Categorize the user's request into EXACTLY ONE of the following intents:
- "BALANCE": Checking account balance or financial status.
- "TRANSFER": Requesting to transfer money, or providing details (like recipient email or amount) for an ongoing transfer.
- "NOT_RELATED": General chit-chat, non-banking questions, or irrelevant requests.

Respond ONLY with a valid JSON object in this format:
{"intent": "BALANCE" | "TRANSFER" | "NOT_RELATED"}`;

  try {
    const response = await model.invoke([
    ["system", systemPrompt],
    ["user", lastMessage]
  ]);

    const cleanedContent = response.content.replace(/```json|```/g, "").trim();
    const result = JSON.parse(cleanedContent);

    if (result.intent === "NOT_RELATED") {
      return {
        intent: "NOT_RELATED",
        messages: [
          ...state.messages,
          {
            role: "assistant",
            content: "SafeBank's assistant is strictly for banking requests. How can I help with your account?"
          }
        ]
      };
    }

    return { intent: result.intent };
  } catch (error) {
    console.error("Intent recognition error:", error);
    return { 
      intent: "NOT_RELATED", 
      messages: [
        ...state.messages,
        {
          role: "assistant",
          content: "I could not understand your request. Please try asking again."
        }
      ]
    };
  }
};

module.exports = { recognizeIntentNode };