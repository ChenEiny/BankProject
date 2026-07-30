// langgraph/nodes/recognizeIntentNode.js

const { model } = require("../config/llm");
const { STRICT_BANK_RULES } = require("../config/systemRules");
const { getLastUserMessage } = require("../utils/messages");

const recognizeIntentNode = async (state) => {
  const input = getLastUserMessage(state);

  const response = await model.invoke([
    {
      role: "system",
      content: `
${STRICT_BANK_RULES}

Classify the current user request into exactly one intent:

- BALANCE: User wants to check their balance.
- TRANSFER: User wants to send or transfer money.
- NOT_RELATED: Request is not related to SafeBank.

Return only JSON:
{"intent":"BALANCE"|"TRANSFER"|"NOT_RELATED"}
`,
    },
    {
      role: "user",
      content: input,
    },
  ]);

  try {
    const parsed = JSON.parse(
      response.content.replace(/```json|```/gi, "").trim()
    );

    const allowed = ["BALANCE", "TRANSFER", "NOT_RELATED"];

    return {
      intent: allowed.includes(parsed.intent)
        ? parsed.intent
        : "NOT_RELATED",
    };
  } catch (error) {
    console.error("Intent recognition error:", error);

    return {
      intent: "NOT_RELATED",
      finalResponse: "I can only assist with SafeBank banking requests.",
    };
  }
};

module.exports = { recognizeIntentNode };