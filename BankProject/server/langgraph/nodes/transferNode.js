const { model } = require('../config/llm');
const { executeTransferTool } = require('../tools/transferTool');

const transferNode = async (state) => {
  const lastMessage = state.messages[state.messages.length - 1]?.content || "";
  
  // 1. נשתמש ב-LLM כדי לחלץ/להשלים פרטי העברה מההודעה האחרונה
  const extractionPrompt = `
  Extract transfer details from the following user message:
  "${lastMessage}"

  Current state transfer details:
  - Receiver Email: ${state.transferDetails?.receiverEmail || "null"}
  - Amount: ${state.transferDetails?.amount || "null"}

  Return ONLY a valid JSON object with:
  {
    "receiverEmail": "extracted email or existing email if valid, otherwise null",
    "amount": extracted number or existing amount if valid, otherwise null
  }
  `;

  let receiverEmail = state.transferDetails?.receiverEmail || null;
  let amount = state.transferDetails?.amount || null;

  try {
    const response = await model.invoke(extractionPrompt);
    const cleanedText = response.content.replace(/```json/g, '').replace(/```/g, '').trim();
    const extracted = JSON.parse(cleanedText);

    if (extracted.receiverEmail) receiverEmail = extracted.receiverEmail;
    if (extracted.amount) amount = Number(extracted.amount);
  } catch (err) {
    console.error("Error extracting transfer details:", err);
  }

  // 2. אם עדיין חסר פרט (אימייל או סכום), עצור ובקש השלמה
  if (!receiverEmail || !amount) {
    return {
      transferDetails: { receiverEmail, amount },
      validationStatus: { 
        isTransferSuccessful: false, 
        missingInfo: !receiverEmail ? "email" : "amount" 
      }
    };
  }

  // 3. במידה וכל הפרטים קיימים - בצע את ההעברה בפועל
  const result = await executeTransferTool(state.user, receiverEmail, amount);

  if (result.success) {
    return {
      transferDetails: { receiverEmail, amount },
      validationStatus: { 
        isTransferSuccessful: true, 
        transaction: result.transaction 
      }
    };
  }

  return {
    transferDetails: { receiverEmail, amount },
    validationStatus: { 
      isTransferSuccessful: false, 
      error: result.error 
    }
  };
};

module.exports = { transferNode };