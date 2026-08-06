const logger = require('../../config/logger');

const llmLogger = logger.child({ module: 'langgraph:llm' });

const truncate = (value, max = 500) => {
    if (value === null || value === undefined) return value;
    const str = typeof value === 'string' ? value : JSON.stringify(value);
    return str.length > max ? `${str.slice(0, max)}... [truncated]` : str;
};

/**
 * Wraps a model.invoke() call so every LLM request/response made by a
 * langgraph node is logged (prompt in, content out, latency, token usage).
 */
const logModelCall = async (nodeName, messages, invoke) => {
    const start = Date.now();
    const userMessage = messages.find((message) => message.role === 'user')?.content;

    try {
        const response = await invoke();
        const durationMs = Date.now() - start;

        llmLogger.info('Model call completed', {
            node: nodeName,
            input: truncate(userMessage),
            output: truncate(response?.content),
            durationMs,
            usage:
                response?.usage_metadata ||
                response?.response_metadata?.tokenUsage ||
                null,
        });

        return response;
    } catch (error) {
        const durationMs = Date.now() - start;

        llmLogger.error('Model call failed', {
            node: nodeName,
            input: truncate(userMessage),
            durationMs,
            error: error.message,
        });

        throw error;
    }
};

module.exports = { logModelCall };
