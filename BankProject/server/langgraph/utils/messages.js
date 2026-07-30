// langgraph/utils/messages.js

const getLastUserMessage = (state) => {
  for (let i = state.messages.length - 1; i >= 0; i -= 1) {
    const message = state.messages[i];

    if (message.role === "user") {
      return String(message.content || "").trim();
    }
  }

  return "";
};

module.exports = { getLastUserMessage };