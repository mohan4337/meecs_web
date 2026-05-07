import React, { useState, useEffect, useRef } from "react";
import "../styles/contact.css";
import { useNavigate } from "react-router-dom";

// API Base URL from .env
const API = process.env.REACT_APP_API_URL?.replace(/\/+$/, "");

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
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Use ref to track if component is mounted (prevent state updates after unmount)
  const isMounted = useRef(true);
  // Use ref to prevent duplicate submissions
  const isSubmitting = useRef(false);

  // ===============================
  // CHATBOT STATES
  // ===============================
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! Ask me anything about power plants." },
  ]);

  const [input, setInput] = useState("");

  // ===============================
  // CLEANUP ON UNMOUNT
  // ===============================
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // ===============================
  // HANDLE CONTACT INPUT CHANGE
  // ===============================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) {
      setTimeout(() => setError(null), 300);
    }
  };

  // ===============================
  // HANDLE CONTACT SUBMIT - OPTIMIZED
  // ===============================
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent double submission
    if (isSubmitting.current || loading) {
      return;
    }
    
    // Validate form data before making request
    const validationErrors = [];
    
    if (!formData.name?.trim()) {
      validationErrors.push("Name is required");
    }
    if (!formData.mobile?.trim()) {
      validationErrors.push("Mobile number is required");
    }
    if (!formData.email?.trim()) {
      validationErrors.push("Email is required");
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        validationErrors.push("Please enter a valid email address");
      }
    }
    if (!formData.message?.trim()) {
      validationErrors.push("Message is required");
    } else if (formData.message.length > 2000) {
      validationErrors.push("Message is too long. Maximum 2000 characters allowed.");
    }
    
    if (validationErrors.length > 0) {
      setError(validationErrors[0]);
      return;
    }

    // Set loading state and lock submission
    isSubmitting.current = true;
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Prepare the request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const requestBody = {
        name: formData.name.trim(),
        mobile: formData.mobile.trim(),
        email: formData.email.trim(),
        message: formData.message.trim()
      };

      const response = await fetch(`${API}/api/contact/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
        // Additional fetch options
        keepalive: true, // Keep connection alive for potential retry
        cache: "no-store" // Don't cache POST requests
      });

      clearTimeout(timeoutId);

      // Check if response is ok (status 200-299)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `Server responded with ${response.status}: ${response.statusText}`
        }));
        
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Success! Reset form
        setFormData({
          name: "",
          mobile: "",
          email: "",
          message: "",
        });
        setSuccess(true);
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          if (isMounted.current) {
            setSuccess(false);
          }
        }, 5000);
      } else {
        throw new Error(data.message || "Request failed");
      }

    } catch (err) {
      console.error("Contact Submit Error:", err);
      
      // Handle different error types
      if (err.name === 'AbortError' || err.message.includes('timeout')) {
        setError("Request timeout. Please check your internet connection and try again.");
      } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        setError("Network error. Please check your connection and try again.");
      } else if (err.message.includes('CORS')) {
        setError("CORS error. Please contact support if this persists.");
      } else if (err.message.includes('Server')) {
        setError("Server is busy. Please try again in a few moments.");
      } else {
        setError(err.message || "Failed to send message. Please try again.");
      }
    } finally {
      // Always reset loading state and unlock submission
      if (isMounted.current) {
        setLoading(false);
        isSubmitting.current = false;
      }
    }
  };

  // ===============================
  // CHATBOT SEND MESSAGE - OPTIMIZED
  // ===============================
  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userText = input.trim();

    setMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setInput("");

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const res = await fetch(`${API}/api/chat/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userText }),
        signal: controller.signal,
        keepalive: true,
        cache: "no-store"
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.reply || `HTTP ${res.status}`);
      }

      const data = await res.json();

      if (data.reply && !data.error) {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: data.reply },
        ]);
      } else {
        throw new Error(data.reply || "No response from AI");
      }

    } catch (error) {
      console.error("Chat Error:", error);
      
      let errorText = "⚠️ Server error. Please try again later.";
      if (error.name === 'AbortError') {
        errorText = "⚠️ Request timeout. Please try again.";
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorText = "⚠️ Connection error. Check your internet.";
      }

      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: errorText },
      ]);
    }
  };

  // Handle keypress for chat
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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

    const navLinks = document.querySelector(".nav-links");
    if (navLinks) {
      navLinks.addEventListener("click", handleClick);
    }

    return () => {
      if (navLinks) {
        navLinks.removeEventListener("click", handleClick);
      }
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

            {error && (
              <div 
                className="error-message" 
                style={{
                  color: 'red', 
                  marginBottom: '15px', 
                  padding: '10px', 
                  backgroundColor: '#ffe6e6', 
                  borderRadius: '5px',
                  animation: 'slideIn 0.3s ease'
                }}
              >
                ⚠️ {error}
              </div>
            )}
            {success && (
              <div 
                className="success-message" 
                style={{
                  color: 'green', 
                  marginBottom: '15px', 
                  padding: '10px', 
                  backgroundColor: '#e6ffe6', 
                  borderRadius: '5px',
                  animation: 'slideIn 0.3s ease'
                }}
              >
                ✅ Message sent successfully! We'll get back to you soon.
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="input-group">
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  aria-label="Name"
                />

                <input
                  type="tel"
                  name="mobile"
                  placeholder="Mobile Number"
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  aria-label="Mobile Number"
                />
              </div>

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
                aria-label="Email"
              />

              <textarea
                name="message"
                placeholder="Message"
                value={formData.message}
                onChange={handleChange}
                required
                disabled={loading}
                aria-label="Message"
                rows={5}
              ></textarea>

              <button 
                type="submit" 
                disabled={loading || isSubmitting.current}
                style={{
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  position: 'relative'
                }}
              >
                {loading ? (
                  <>
                    <span>Sending...</span>
                    <span style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      fontSize: '12px'
                    }}>
                      ⏳
                    </span>
                  </>
                ) : (
                  "Submit Your Enquiry"
                )}
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
          style={{ border: 0 }}
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
            onKeyDown={handleKeyPress}
            disabled={loading}
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            style={{
              opacity: (loading || !input.trim()) ? 0.5 : 1,
              cursor: (loading || !input.trim()) ? 'not-allowed' : 'pointer'
            }}
          >
            Send
          </button>
        </div>

      </div>
    </div>
  );
};

export default ContactUs;
