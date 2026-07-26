const { bankGraph } = require('../langgraph/bankGraph');
const { AppError } = require('../middleware/errorWrapper');

const handleChatMessage = async (req, res) => {
  const { message, history } = req.body;

  if (!message) {
    throw new AppError("Message is required", 400);
  }

  // Mapped incoming history format if provided
  const formattedHistory = Array.isArray(history)
    ? history.map(m => ({
        role: m.role === 'model' ? 'assistant' : 'user',
        content: m.parts?.[0]?.text || m.content || ''
      }))
    : [];

  // Initialize graph state with request data
  const initialState = {
    messages: [
      ...formattedHistory,
      { role: 'user', content: message }
    ],
    user: req.user || { email: "Customer" }
  };

  // Run graph workflow
  const finalState = await bankGraph.invoke(initialState);

  return {
    reply: finalState.finalResponse,
    intent: finalState.intent
  };
};

module.exports = { handleChatMessage };