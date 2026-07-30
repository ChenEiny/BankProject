// langgraph/nodes/extractTransferDetailsNode.js

const { model } = require("../config/llm");
const { getLastUserMessage } = require("../utils/messages");

const extractTransferDetailsNode = async (state) => {
  const input = getLastUserMessage(state);
  const current = state.transferDetails || {};

  const response = await model.invoke([
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
  ]);

  try {
    const parsed = JSON.parse(
      response.content.replace(/```json|```/gi, "").trim()
    );

    const parsedAmount =
      parsed.amount === null || parsed.amount === undefined
        ? null
        : Number(parsed.amount);

    return {
      phase: "COLLECTING_TRANSFER",

      transferDetails: {
        receiverEmail:
          parsed.receiverEmail ||
          current.receiverEmail ||
          null,

        amount:
          Number.isFinite(parsedAmount)
            ? parsedAmount
            : current.amount ?? null,
      },

      validationStatus: {
        emailValid: false,
        amountValid: false,
        emailError: null,
        amountError: null,
      },

      finalResponse: null,
    };
  } catch (error) {
    console.error("Transfer extraction error:", error);

    return {
      phase: "COLLECTING_TRANSFER",
      finalResponse:
        "Please provide the recipient email and transfer amount.",
    };
  }
};

module.exports = { extractTransferDetailsNode };