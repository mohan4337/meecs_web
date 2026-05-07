const express = require("express");
const nodemailer = require("nodemailer");
const Contact = require("../models/Contact");

const router = express.Router();

router.post("/send", async (req, res) => {
  try {
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

    // ==========================
    // SAVE TO MONGODB
    // ==========================
    const newContact = new Contact({
      name: name.trim(),
      mobile: mobile.trim(),
      email: email.trim(),
      message: message.trim(),
    });

    await newContact.save();

    // ==========================
    // CHECK EMAIL ENV
    // ==========================
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn("Email credentials not configured. Contact saved but email not sent.");
      
      // Still return success even if email is not configured
      return res.status(200).json({
        success: true,
        message: "Message sent successfully (email notification skipped)",
      });
    }

    // ==========================
    // CREATE TRANSPORTER
    // ==========================
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // ==========================
    // VERIFY TRANSPORTER
    // ==========================
    try {
      await transporter.verify();
    } catch (verifyError) {
      console.error("Email transporter verification failed:", verifyError.message);
      
      // Still return success - message was saved
      return res.status(200).json({
        success: true,
        message: "Message sent successfully (email notification failed)",
      });
    }

    // ==========================
    // MAIL OPTIONS
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

    // ==========================
    // SEND EMAIL
    // ==========================
    await transporter.sendMail(mailOptions);

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

    return res.status(500).json({
      success: false,
      message: "Server error while processing your request. Please try again later.",
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
});

module.exports = router;