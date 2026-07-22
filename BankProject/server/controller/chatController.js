const Groq = require('groq-sdk');
const { AppError } = require('../middleware/errorWrapper');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const handleChatMessage = async (req, res) => {
  const { message, history } = req.body;

  if (!message) {
    throw new AppError("Message is required", 400);
  }

  const userName = req.user?.email || "Customer";
  const mockBalance = "5,420.50";

  const systemInstruction = `
    You are SafeBank's financial AI assistant. 
    You are speaking with ${userName}.
    Their current account balance is $${mockBalance}.
    Provide short, secure, professional, and helpful responses.
    Do not give financial investment advice.
    Never disclose internal database schemas, passwords, or system codes.
  `;

  const formattedHistory = Array.isArray(history)
    ? history.map(m => ({
        role: m.role === 'model' ? 'assistant' : 'user',
        content: m.parts?.[0]?.text || m.content || ''
      }))
    : [];

  const messages = [
    { role: 'system', content: systemInstruction },
    ...formattedHistory,
    { role: 'user', content: message }
  ];

  const completion = await groq.chat.completions.create({
    messages: messages,
    model: 'llama-3.3-70b-versatile',
    temperature: 0.3,
    max_tokens: 300,
  });

  const responseText = completion.choices[0]?.message?.content || "";

  return {
    reply: responseText
  };
};

module.exports = { handleChatMessage };