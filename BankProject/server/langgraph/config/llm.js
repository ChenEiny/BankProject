const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");

// Change LLM_MODEL in .env to switch models later without touching code.
const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
  model: process.env.LLM_MODEL || "gemini-flash-latest",
  temperature: 0,
});

module.exports = { model };