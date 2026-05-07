const nodemailer = require("nodemailer");

let transporter = null;

const getTransporter = () => {
  // Return cached transporter if exists
  if (transporter) {
    return transporter;
  }

  // Check for email credentials
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("Email credentials not configured");
    return null;
  }

  // Create new transporter
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // Timeout settings for serverless
    connectionTimeout: 10000,
    socketTimeout: 30000,
  });

  // Verify transporter connection (async but don't await)
  transporter.verify().then(() => {
    console.log("✅ Email transporter verified");
  }).catch((error) => {
    console.error("❌ Email transporter verification failed:", error.message);
    transporter = null;
  });

  return transporter;
};

module.exports = getTransporter;
