
const askMissingInfoNode = async (state) => {
  switch (state.missingField) {
    case "EMAIL_AND_AMOUNT":
      return {
        phase: "COLLECTING_TRANSFER",
        finalResponse:
          "Please provide the recipient email and transfer amount.",
      };

    case "EMAIL":
      return {
        phase: "COLLECTING_TRANSFER",
        finalResponse:
          "Please provide the recipient email address.",
      };

    case "AMOUNT":
      return {
        phase: "COLLECTING_TRANSFER",
        finalResponse:
          "Please provide the transfer amount.",
      };

    default:
      return {
        finalResponse: null,
      };
  }
};

module.exports = { askMissingInfoNode };