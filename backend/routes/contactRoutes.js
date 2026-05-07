const express = require("express");
const Contact = require("../models/Contact");
const getTransporter = require("../utils/transporter");
const retry = require("../utils/retry");

const router = express.Router();

// Request timeout middleware
const timeout = (ms) => (req, res, next) => {
  if (!res.headersSent) {
    setTimeout(() => {
      if (!res.headersSent) {
        res.status(504).json({
          success: false,
          message: "Request timeout - server is busy, please try again",
        });
      }
    }, ms);
  }
  next();
};

router.use(timeout(30000));

router.post("/send", async (req, res) => {
  const { name, mobile, email, message } = req.body;

  // ==========================
  // VALIDATION
  // ==========================
  if (!name || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: "Name is required",
    });
  }

  if (!mobile || !mobile.trim()) {
    return res.status(400).json({
      success: false,
      message: "Mobile number is required",
    });
  }

  if (!email || !email.trim()) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid email address",
    });
  }

  if (!message || !message.trim()) {
    return res.status(400).json({
      success: false,
      message: "Message is required",
    });
  }

  // Message length check
  if (message.length > 2000) {
    return res.status(400).json({
      success: false,
      message: "Message is too long. Maximum 2000 characters allowed.",
    });
  }

  try {
    // ==========================
    // SAVE TO MONGODB WITH RETRY
    // ==========================
    const newContact = new Contact({
      name: name.trim(),
      mobile: mobile.trim(),
      email: email.trim(),
      message: message.trim(),
    });

    // Save with retry logic for transient DB failures
    await retry(
      () => newContact.save(),
      {
        maxAttempts: 3,
        minDelay: 100,
        maxDelay: 500,
        onRetry: (err, attempt) => {
          console.log(`DB save retry attempt ${attempt}: ${err.message}`);
        }
      }
    );

    // ==========================
    // CHECK EMAIL TRANSPORTER
    // ==========================
    const transporter = getTransporter();

    if (!transporter) {
      console.warn("Email transporter not available, skipping email send");
      return res.status(200).json({
        success: true,
        message: "Message sent successfully!",
        note: "Email notification skipped - server configuration",
      });
    }

    // ==========================
    // SEND EMAIL WITH RETRY
    // ==========================
    const mailOptions = {
      from: `"MMSR Website" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: "📩 New Contact Enquiry - MMSR Website",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #000080;">New Contact Message</h2>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${name.trim()}</p>
            <p><strong>Mobile:</strong> ${mobile.trim()}</p>
            <p><strong>Email:</strong> ${email.trim()}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <h3 style="color: #000080;">Message:</h3>
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #000080;">
            <p style="white-space: pre-wrap; margin: 0;">${message.trim()}</p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;" />
          
          <p style="color: #666; font-size: 12px;">
            This message was sent through the MMSR website contact form.
          </p>
        </div>
      `,
    };

    // Send with retry for transient failures
    await retry(
      () => transporter.sendMail(mailOptions),
      {
        maxAttempts: 2,
        minDelay: 200,
        maxDelay: 1000,
        onRetry: (err, attempt) => {
          console.log(`Email send retry attempt ${attempt}: ${err.message}`);
        }
      }
    );

    // ==========================
    // SUCCESS RESPONSE
    // ==========================
    return res.status(200).json({
      success: true,
      message: "Message sent successfully!",
    });

  } catch (error) {
    console.error("Contact Route Error:", error.message);
    console.error("Stack trace:", error.stack);

    // Determine error type
    let errorMessage = "Server error while processing your request. Please try again later.";
    let statusCode = 500;

    if (error.message.includes("timeout") || error.message.includes("Timeout")) {
      errorMessage = "Server is busy. Please try again in a moment.";
      statusCode = 504;
    } else if (error.message.includes("Database") || error.message.includes("ECONNREFUSED")) {
      errorMessage = "Database connection error. Please try again later.";
      statusCode = 503;
    } else if (error.message.includes("Email") || error.message.includes("mail")) {
      // Email failed but message saved
      errorMessage = "Message saved but email notification failed.";
      statusCode = 200; // Still success for the user
    }

    return res.status(statusCode).json({
      success: false,
      message: errorMessage,
      ...(process.env.NODE_ENV === 'development' && { 
        error: error.message,
        stack: error.stack 
      })
    });
  }
});

module.exports = router;