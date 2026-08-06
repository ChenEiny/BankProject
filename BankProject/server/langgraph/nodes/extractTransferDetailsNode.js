
const { model } = require("../config/llm");
const { getLastUserMessage } = require("../utils/messages");
const { logModelCall } = require("../utils/llmLogger");
const logger = require("../../config/logger").child({ module: "langgraph:extractTransferDetailsNode" });

const extractTransferDetailsNode = async (state) => {
  const input = getLastUserMessage(state);
  const current = state.transferDetails || {};

  const messages = [
    {
      role: "system",
      content: `
Extract transfer details from the latest user message.

Previously collected details:
- receiverEmail: ${current.receiverEmail || "null"}
- amount: ${current.amount ?? "null"}

Rules:
- Preserve existing details when the user does not replace them.
- amount must be returned as a number.
- Do not invent missing values.

Return only JSON:
{
  "receiverEmail": string | null,
  "amount": number | null
}
`,
    },
    {
      role: "user",
      content: input,
    },
  ];

  const response = await logModelCall("extractTransferDetailsNode", messages, () =>
    model.invoke(messages)
  );

  try {
    const parsed = JSON.parse(
      response.content.replace(/```json|```/gi, "").trim()
    );

    const parsedAmount =
      parsed.amount === null || parsed.amount === undefined
        ? null
        : Number(parsed.amount);

    const transferDetails = {
      receiverEmail:
        parsed.receiverEmail ||
        current.receiverEmail ||
        null,

      amount:
        Number.isFinite(parsedAmount)
          ? parsedAmount
          : current.amount ?? null,
    };

    logger.debug("Transfer details extracted", transferDetails);

    return {
      phase: "COLLECTING_TRANSFER",

      transferDetails,

      validationStatus: {
        emailValid: false,
        amountValid: false,
        emailError: null,
        amountError: null,
      },

      finalResponse: null,
    };
  } catch (error) {
    logger.error("Transfer extraction error", { error: error.message });

    return {
      phase: "COLLECTING_TRANSFER",
      finalResponse:
        "Please provide the recipient email and transfer amount.",
    };
  }
};

module.exports = { extractTransferDetailsNode };