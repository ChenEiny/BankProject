
const { model } = require("../config/llm");
const { STRICT_BANK_RULES } = require("../config/systemRules");
const { getLastUserMessage } = require("../utils/messages");
const { logModelCall } = require("../utils/llmLogger");
const logger = require("../../config/logger").child({ module: "langgraph:recognizeIntentNode" });

const recognizeIntentNode = async (state) => {
  const input = getLastUserMessage(state);

  const messages = [
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
  ];

  const response = await logModelCall("recognizeIntentNode", messages, () =>
    model.invoke(messages)
  );

  try {
    const parsed = JSON.parse(
      response.content.replace(/```json|```/gi, "").trim()
    );

    const allowed = ["BALANCE", "TRANSFER", "NOT_RELATED"];
    const intent = allowed.includes(parsed.intent) ? parsed.intent : "NOT_RELATED";

    logger.debug("Intent recognized", { intent });

    return { intent };
  } catch (error) {
    logger.error("Intent recognition error", { error: error.message });

    return {
      intent: "NOT_RELATED",
      finalResponse: "I can only assist with SafeBank banking requests.",
    };
  }
};

module.exports = { recognizeIntentNode };