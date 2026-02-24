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
    if (!name || !mobile || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // ==========================
    // SAVE TO MONGODB
    // ==========================
    const newContact = new Contact({
      name,
      mobile,
      email,
      message,
    });

    await newContact.save();

    // ==========================
    // CHECK EMAIL ENV
    // ==========================
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("Missing email credentials");

      return res.status(500).json({
        success: false,
        message: "Email config missing",
      });
    }

    // ==========================
    // CREATE TRANSPORTER
    // ==========================
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // App Password
      },
    });

    // ==========================
    // VERIFY TRANSPORTER (IMPORTANT)
    // ==========================
    await transporter.verify();

    // ==========================
    // MAIL OPTIONS
    // ==========================
    const mailOptions = {
      from: `"MMSR Website" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: "📩 New Contact Enquiry",
      html: `
        <h3>New Contact Message</h3>

        <p><b>Name:</b> ${name}</p>
        <p><b>Mobile:</b> ${mobile}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Message:</b> ${message}</p>

        <hr/>
        <p>Sent from MMSR Website</p>
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
      message: "Message sent successfully",
    });

  } catch (error) {
    console.error("Contact Route Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while sending message",
    });
  }
});

module.exports = router;