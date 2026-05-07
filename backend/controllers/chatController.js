const Groq = require("groq-sdk");
const { success, error } = require("../utils/response");

exports.askQuestion = async (req, res) => {
  const { message } = req.body;

  // ==========================
  // VALIDATION
  // ==========================
  if (!message || !message.trim()) {
    return res.status(400).json({
      reply: "Please provide a message to ask.",
      error: true
    });
  }

  // Check message length
  if (message.length > 2000) {
    return res.status(400).json({
      reply: "Message is too long. Please limit to 2000 characters.",
      error: true
    });
  }

  try {
    // Create Groq client
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
      // Configure timeout (default is 30s)
      httpOptions: {
        timeout: 15000, // 15 seconds
        headers: {
          'User-Agent': 'MMSR-ChatBot/1.0'
        }
      }
    });

    // Set up timeout promise
    const timeoutPromise = new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          choices: [{
            message: {
              content: "The AI assistant is currently taking too long to respond. Please try a shorter question or try again."
            }
          }],
          timedOut: true
        });
      }, 12000); // 12 second timeout
    });

    // Make request with Promise.race for timeout handling
    const chatCompletionPromise = groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant for power plant related questions. Provide concise, accurate information about power plants, energy systems, and engineering topics. Keep responses under 500 characters when possible."
        },
        {
          role: "user",
          content: message.trim().substring(0, 2000)
        },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 512, // Reduced for faster responses
    });

    const chatCompletion = await Promise.race([
      chatCompletionPromise,
      timeoutPromise
    ]);

    // Check if it timed out
    if (chatCompletion.timedOut) {
      console.warn("Chat request timed out for message:", message.substring(0, 50));
      return res.status(504).json({
        reply: "The AI assistant took too long to respond. Please try again with a shorter question.",
        error: true
      });
    }

    const reply = chatCompletion.choices[0]?.message?.content || 
                  "I'm sorry, I couldn't generate a response. Please try again.";

    return success(res, { reply });

  } catch (error) {
    console.error("Groq Error:", error.message);
    console.error("Stack:", error.stack);
    
    // Determine error type
    let statusCode = 500;
    let userMessage = "The AI assistant is currently unavailable. Please try again in a few moments. If the issue persists, contact support at mmenggservice@gmail.com";
    
    if (error.message?.includes('timeout') || error.message?.includes('ETIMEDOUT')) {
      statusCode = 504;
      userMessage = "AI service timeout. Please try again with a shorter question.";
    } else if (error.message?.includes('API key') || error.message?.includes('401')) {
      statusCode = 503;
      userMessage = "AI service configuration error. Please contact support.";
      console.error("Groq API Key issue - check environment variables");
    } else if (error.message?.includes('429')) {
      statusCode = 429;
      userMessage = "AI service rate limit exceeded. Please try again in a minute.";
    } else if (error.message?.includes('network') || error.message?.includes('ENOTFOUND')) {
      statusCode = 503;
      userMessage = "Network error connecting to AI service. Please check your connection.";
    }
    
    return res.status(statusCode).json({
      reply: userMessage,
      error: true,
      ...(process.env.NODE_ENV === 'development' && { 
        details: error.message 
      })
    });
  }
};
 