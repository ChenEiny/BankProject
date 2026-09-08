const { ChatGroq } = require("@langchain/groq");

// Change LLM_MODEL in .env to switch models later without touching code.
const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: process.env.LLM_MODEL || "openai/gpt-oss-20b",
  temperature: 0,
});

module.exports = { model };