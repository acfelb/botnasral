const TerminalErrors = require("./TerminalErrors.json");
const FindErrorCode = function (code) {
  return TerminalErrors.find((item) => item.ErrorCode == code);
};
module.exports = { FindErrorCode };
