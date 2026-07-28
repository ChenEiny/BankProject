// controller/chatController.js
const { bankGraph } = require('../langgraph/bankGraph');
const { AppError } = require('../middleware/errorWrapper');

const handleChatMessage = async (req, res) => {
  const { message, history, sessionState } = req.body;

  if (!message) {
    throw new AppError("Message is required", 400);
  }

  const formattedHistory = Array.isArray(history)
    ? history.map(m => ({
        role: m.role === 'model' || m.role === 'assistant' ? 'assistant' : 'user',
        content: m.parts?.[0]?.text || m.content || ''
      }))
    : [];

  const initialState = {
    ...sessionState,
    messages: [
      ...formattedHistory,
      { role: 'user', content: message }
    ],
    user: req.user || { id: 2, email: "einy0002@gmail.com" }
  };

  const finalState = await bankGraph.invoke(initialState);

  const lastAssistantMessage = finalState.messages?.[finalState.messages.length - 1]?.content;
  const replyText = finalState.finalResponse || lastAssistantMessage || "I'm sorry, I couldn't process your request.";

  return res.json({
    reply: replyText,
    intent: finalState.intent,
    sessionState: {
      intent: finalState.intent,
      transferDetails: finalState.transferDetails,
      validationStatus: finalState.validationStatus,
      humanApproved: finalState.humanApproved
    }
  });
};

module.exports = { handleChatMessage };