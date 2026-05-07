// Request ID generator for tracing requests across logs
const crypto = require("crypto");

let requestCounter = 0;

const generateRequestId = () => {
  const random = crypto.randomBytes(4).toString('hex');
  const timestamp = Date.now().toString(36);
  const counter = (++requestCounter).toString(36);
  return `${timestamp}-${counter}-${random}`;
};

module.exports = {
  generateRequestId
};
