import React, { useState, useEffect } from "react";
import "../styles/contact.css";
import { useNavigate } from "react-router-dom";

// API Base URL from .env
const API = process.env.REACT_APP_API_URL;

const ContactUs = () => {
  const navigate = useNavigate();

  // ===============================
  // CONTACT FORM STATE
  // ===============================
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  // ===============================
  // CHATBOT STATES
  // ===============================
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! Ask me anything about power plants." },
  ]);

  const [input, setInput] = useState("");

  // ===============================
  // HANDLE CONTACT INPUT CHANGE
  // ===============================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ===============================
  // HANDLE CONTACT SUBMIT
  // ===============================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/contact/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert("✅ Message sent successfully!");

        setFormData({
          name: "",
          mobile: "",
          email: "",
          message: "",
        });
      } else {
        alert("❌ Failed to send message.");
      }
    } catch (error) {
      console.error("Contact Error:", error);
      alert("⚠️ Server error. Please try again later.");
    }

    setLoading(false);
  };

  // ===============================
  // CHATBOT SEND MESSAGE
  // ===============================
  const handleSend = async () => {
    if (!input.trim()) return;

    const userText = input;

    setMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setInput("");

    try {
      const res = await fetch(`${API}/api/chat/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userText }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: data.reply || "No response" },
        ]);
      } else {
        throw new Error("Chat API failed");
      }
    } catch (error) {
      console.error("Chat Error:", error);

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "⚠️ Server error. Please try again later.",
        },
      ]);
    }
  };

  // ===============================
  // NAVIGATION HANDLING
  // ===============================
  useEffect(() => {
    const handleClick = (e) => {
      if (e.target.tagName === "A") {
        const href = e.target.getAttribute("href");

        if (href.startsWith("#")) {
          e.preventDefault();

          const targetId = href.substring(1);
          const targetElement = document.getElementById(targetId);

          if (targetElement) {
            window.scrollTo({
              top: targetElement.offsetTop - 50,
              behavior: "smooth",
            });
          }
        } else if (href === "/about") {
          e.preventDefault();
          navigate("/about");
        }
      }
    };

    document
      .querySelector(".nav-links")
      ?.addEventListener("click", handleClick);

    return () => {
      document
        .querySelector(".nav-links")
        ?.removeEventListener("click", handleClick);
    };
  }, [navigate]);

  return (
    <div>
      {/* ================= HERO SECTION ================= */}
      <section className="hero-section">
        <div className="overlay"></div>

        <div className="hero-content">
          <h1>Contact Us</h1>

          <p>
            <a href="/home">Home</a> » <span>Contact Us</span>
          </p>
        </div>
      </section>

      {/* ================= CONTACT SECTION ================= */}
      <section className="contact-section">
        <div className="contact-container">

          {/* Contact Info */}
          <div className="contact-info">
            <h3>Contact Information</h3>

            <h1>Feel Free To Get In Touch</h1>

            <p>
              At MMSR, a vision driven by innovation, precision, and resilience
              across mechanical, civil, electrical, and communication engineering.
            </p>

            <h3 className="city">Dubai</h3>

            <p>
              📫 Email:{" "}
              <a href="mailto:mmenggservice@gmail.com">
                mmenggservice@gmail.com
              </a>
            </p>

            <p>📱 Mobile: +91 123456789</p>
            <p>📱 Mobile: +91 8778269597</p>
            <p>📱 Mobile: +971 545313855</p>
            <p>📍 Address: Dubai</p>
          </div>

          {/* Contact Form */}
          <div className="contact-form">
            <h1>Drop Us A Message</h1>

            <form onSubmit={handleSubmit}>
              <div className="input-group">

                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />

                <input
                  type="text"
                  name="mobile"
                  placeholder="Mobile Number"
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                />

              </div>

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <textarea
                name="message"
                placeholder="Message"
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>

              <button type="submit" disabled={loading}>
                {loading ? "Sending..." : "Submit Your Enquiry"}
              </button>

            </form>
          </div>

        </div>
      </section>

      {/* ================= MAP ================= */}
      <div className="map-section">
        <h2>Our Location</h2>

        <iframe
          title="MMSR Location"
          src="https://www.google.com/maps?q=25.678525,55.786082&z=15&output=embed"
          width="100%"
          height="400"
          loading="lazy"
        ></iframe>
      </div>

      {/* ================= CHATBOT ================= */}
      <div className="chatbot-container">

        <div className="chat-header">
          Power Plant Chatbot
        </div>

        <div className="chat-window">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.sender}`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        <div className="chat-input">

          <input
            type="text"
            value={input}
            placeholder="Ask about power plants..."
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />

          <button onClick={handleSend}>
            Send
          </button>

        </div>
      </div>
    </div>
  );
};

export default ContactUs;