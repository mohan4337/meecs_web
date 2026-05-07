import React, { useState, useEffect, useRef, useCallback } from "react";
import "../styles/contact.css";
import { useNavigate } from "react-router-dom";
import { getApiClient, getChatApiClient, startKeepAlive, stopKeepAlive } from "../utils/apiClient";

// API Base URL from .env
const API = process.env.REACT_APP_API_URL?.replace(/\/+$/, "");

// Initialize API client
let apiClient = null;
let chatApiClient = null;

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
  
  // Refs to prevent issues
  const isMounted = useRef(true);
  const isSubmitting = useRef(false);
  const retryCount = useRef(0);

  // ===============================
  // CHATBOT STATES
  // ===============================
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! Ask me anything about power plants." },
  ]);

  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // ===============================
  // INITIALIZE API CLIENT & KEEP-ALIVE
  // ===============================
  useEffect(() => {
    if (API) {
      apiClient = getApiClient(API);
      chatApiClient = getChatApiClient(API);
      
      // Start keep-alive pings to prevent cold starts
      startKeepAlive(API, 60000); // Ping every 60 seconds
    }

    return () => {
      isMounted.current = false;
      stopKeepAlive();
    };
  }, []);

  // ===============================
  // GET USER-FRIENDLY ERROR MESSAGE
  // ===============================
  const getErrorMessage = (err) => {
    if (!err) return "An unknown error occurred";

    // Handle AbortError (timeout)
    if (err.name === 'AbortError' || err.code === 'TIMEOUT') {
      return "Request timed out. The server took too long to respond. Please try again.";
    }

    // Network errors
    if (err.code === 'NETWORK_ERROR' || 
        err.message?.includes('Failed to fetch') || 
        err.message?.includes('NetworkError')) {
      return "Network error. Please check your internet connection and try again.";
    }

    // CORS errors
    if (err.code === 'CORS_ERROR' || err.message?.includes('CORS')) {
      return "Connection blocked. Please refresh the page and try again.";
    }

    // Server errors (5xx)
    if (err.status >= 500) {
      return "Server is currently unavailable. Please try again in a few moments.";
    }

    // Validation errors (4xx)
    if (err.status === 400) {
      return err.data?.message || "Invalid request. Please check your input.";
    }

    // Rate limit
    if (err.status === 429) {
      return "Too many requests. Please wait a moment before trying again.";
    }

    // Default - use server message if available
    return err.message || "Something went wrong. Please try again.";
  };

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
      setError(null);
    }
  };

  // ===============================
  // HANDLE CONTACT SUBMIT - WITH RETRY
  // ===============================
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent double submission
    if (isSubmitting.current || loading) {
      return;
    }

    // Validation
    const validationErrors = [];
    if (!formData.name?.trim()) validationErrors.push("Name is required");
    if (!formData.mobile?.trim()) validationErrors.push("Mobile is required");
    if (!formData.email?.trim()) {
      validationErrors.push("Email is required");
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        validationErrors.push("Invalid email format");
      }
    }
    if (!formData.message?.trim()) {
      validationErrors.push("Message is required");
    } else if (formData.message.length > 2000) {
      validationErrors.push("Message exceeds 2000 character limit");
    }

    if (validationErrors.length > 0) {
      setError(validationErrors[0]);
      return;
    }

    // Lock submission
    isSubmitting.current = true;
    setLoading(true);
    setError(null);
    setSuccess(false);
    retryCount.current = 0;

    try {
      const requestBody = {
        name: formData.name.trim(),
        mobile: formData.mobile.trim(),
        email: formData.email.trim(),
        message: formData.message.trim()
      };

      const result = await apiClient.post('/api/contact/send', requestBody, {
        retries: 2, // Retry up to 2 times on server errors
        timeout: 30000
      });

      if (result.success && result.data?.success) {
        // Success! Reset form
        setFormData({ name: "", mobile: "", email: "", message: "" });
        setSuccess(true);
        retryCount.current = 0;

        // Clear success message after 5 seconds
        setTimeout(() => {
          if (isMounted.current) {
            setSuccess(false);
          }
        }, 5000);
      } else {
        throw new Error(result.data?.message || "Request failed");
      }

    } catch (err) {
      console.error("Contact Submit Error:", err);
      
      // Increment retry count for tracking
      retryCount.current += 1;

      // Show appropriate error message
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);

      // If it's a network error and first attempt, we already retried via apiClient
      // Show a hint to user
      if (err.code === 'NETWORK_ERROR' && retryCount.current >= 2) {
        setError(prev => `${prev} (Please check if the backend server is running)`);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
        isSubmitting.current = false;
      }
    }
  };

  // ===============================
  // CHATBOT SEND MESSAGE - WITH RETRY
  // ===============================
  const handleSend = useCallback(async () => {
    if (!input.trim() || chatLoading) return;

    const userText = input.trim();

    setMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setInput("");
    setChatLoading(true);

    try {
      const result = await chatApiClient.post('/api/chat/ask', 
        { message: userText },
        {
          retries: 1, // Quick retry for chat
          timeout: 15000
        }
      );

      if (result.success && result.data?.reply && !result.data.error) {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: result.data.reply },
        ]);
      } else {
        throw new Error(result.data?.reply || "No response from AI");
      }

    } catch (err) {
      console.error("Chat Error:", err);
      
      let errorText = "⚠️ Server error. Please try again later.";
      
      if (err.code === 'TIMEOUT') {
        errorText = "⚠️ AI assistant took too long. Try a shorter question.";
      } else if (err.code === 'NETWORK_ERROR') {
        errorText = "⚠️ Connection error. Check internet and retry.";
      } else if (err.status === 429) {
        errorText = "⚠️ Rate limit reached. Please wait a moment.";
      } else if (err.status === 503) {
        errorText = "⚠️ AI service unavailable. Please try again later.";
      }

      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: errorText },
      ]);
    } finally {
      setChatLoading(false);
    }
  }, [input, chatLoading]);

  // Handle keypress for chat
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !chatLoading) {
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
            <p>📫 Email: <a href="mailto:mmenggservice@gmail.com">mmenggservice@gmail.com</a></p>
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
                  animation: 'slideIn 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>⚠️</span>
                <span>{error}</span>
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
                  animation: 'slideIn 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>✅</span>
                <span>Message sent successfully! We'll get back to you soon.</span>
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
                  position: 'relative',
                  transition: 'opacity 0.2s ease'
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
          {chatLoading && (
            <div className="message bot">
              <span style={{ display: 'inline-flex', gap: '4px' }}>
                <span>●</span>
                <span>●</span>
                <span>●</span>
              </span>
            </div>
          )}
        </div>

        <div className="chat-input">
          <input
            type="text"
            value={input}
            placeholder="Ask about power plants..."
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={chatLoading}
          />
          <button 
            onClick={handleSend}
            disabled={chatLoading || !input.trim()}
            style={{
              opacity: (chatLoading || !input.trim()) ? 0.5 : 1,
              cursor: (chatLoading || !input.trim()) ? 'not-allowed' : 'pointer',
              transition: 'opacity 0.2s ease'
            }}
          >
            {chatLoading ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
