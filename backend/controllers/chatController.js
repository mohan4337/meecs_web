const Groq = require("groq-sdk");

exports.askQuestion = async (req, res) => {
  try {
    const { message } = req.body;

    // Validate input
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

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant for power plant related questions. Provide concise, accurate information about power plants, energy systems, and engineering topics."
        },
        {
          role: "user",
          content: message,
        },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 1024,
    });

    const reply = chatCompletion.choices[0].message.content;

    return res.json({ reply, error: false });

  } catch (error) {
    console.error("Groq Error:", error.message);
    
    // Return graceful error message to user
    return res.status(500).json({
      reply: "The AI assistant is currently unavailable. Please try again in a few moments. If the issue persists, contact support at mmenggservice@gmail.com",
      error: true,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
 