const {
  Command,
} = require("@langchain/langgraph");

const {
  bankGraph,
} = require("../langgraph/bankGraph");

const {
  AppError,
} = require("../middleware/errorWrapper");

const {
  CallbackHandler,
} = require("langfuse-langchain");

/**
 * מחפש interrupt פעיל בתוך snapshot של LangGraph.
 */
const getActiveInterrupt = (snapshot) => {
  const tasks = Array.isArray(snapshot?.tasks)
    ? snapshot.tasks
    : [];

  for (const task of tasks) {
    const interrupts = Array.isArray(task?.interrupts)
      ? task.interrupts
      : [];

    if (interrupts.length > 0) {
      return interrupts[0];
    }
  }

  return null;
};

/**
 * מחלץ הודעת assistant אחרונה בלבד.
 */
const getLastAssistantMessage = (messages = []) => {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];

    if (message?.role === "assistant") {
      return typeof message.content === "string"
        ? message.content
        : String(message.content || "");
    }
  }

  return null;
};

const handleChatMessage = async (req, res) => {
  const { message, sessionId } = req.body;

  const normalizedMessage = String(message || "").trim();

  if (!normalizedMessage) {
    throw new AppError("Message is required", 400);
  }

  const currentUser =
    req.user ||
    {
      id: 2,
      email: "einy0002@gmail.com",
    };

  /*
   * מומלץ שה-client ייצור UUID פעם אחת לכל שיחת chat.
   * אין להחליף אותו בין הודעת ההעברה לבין הודעת YES.
   */
  const conversationId =
    sessionId ||
    req.body.sessionState?.sessionId;

  if (!conversationId) {
    throw new AppError("Session ID is required", 400);
  }

  const graphConfig = {
    configurable: {
      thread_id: String(conversationId),
    },
  };

  const langfuseHandler = new CallbackHandler({
    sessionId: String(conversationId),
    userId: String(currentUser.id),
    tags: ["SafeBank-Dev"],
  });

  const invokeConfig = {
    ...graphConfig,
    callbacks: [langfuseHandler],
  };

  /*
   * בודקים האם השיחה כבר נעצרה ב-humanApprovalNode.
   */
  const snapshot = await bankGraph.getState(graphConfig);
  const activeInterrupt = getActiveInterrupt(snapshot);

  let finalState;

  if (activeInterrupt) {
    /*
     * המשתמש עונה על שאלה שהגיעה מ-interrupt.
     * למשל YES או NO.
     *
     * לא מתחילים את הגרף מחדש ולא שולחים messages חדשים.
     */
    finalState = await bankGraph.invoke(
      new Command({
        resume: normalizedMessage,
      }),
      invokeConfig
    );
  } else {
    /*
     * בקשה בנקאית חדשה או המשך איסוף מידע רגיל.
     * למשל:
     * send 20
     * ואז:
     * cheiny247@gmail.com
     */
    finalState = await bankGraph.invoke(
      {
        messages: [
          {
            role: "user",
            content: normalizedMessage,
          },
        ],
        user: currentUser,
        finalResponse: null,
      },
      invokeConfig
    );
  }

  /*
   * ייתכן שההרצה הנוכחית יצרה interrupt חדש.
   * למשל אחרי אימות האימייל והסכום.
   */
  const returnedInterrupt =
    Array.isArray(finalState?.__interrupt__) &&
    finalState.__interrupt__.length > 0
      ? finalState.__interrupt__[0]
      : null;

  if (returnedInterrupt) {
    const interruptValue = returnedInterrupt.value;

    const reply =
      typeof interruptValue === "string"
        ? interruptValue
        : interruptValue?.message ||
          "Please confirm the transfer.";

    return res.json({
      reply,
      awaitingApproval: true,
      sessionId: String(conversationId),

      /*
       * אפשר להחזיר מידע לתצוגה בלבד.
       * ה-client לא צריך להחזיר אותו אל השרת בתור state.
       */
      approvalRequest:
        typeof interruptValue === "object"
          ? interruptValue
          : null,
    });
  }

  const lastAssistantMessage =
    getLastAssistantMessage(finalState.messages);

  const replyText =
    finalState.finalResponse ||
    lastAssistantMessage ||
    "I'm sorry, I couldn't process your request.";

  return res.json({
    reply: replyText,
    awaitingApproval: false,
    sessionId: String(conversationId),
    intent: finalState.intent || null,
  });
};

module.exports = {
  handleChatMessage,
};