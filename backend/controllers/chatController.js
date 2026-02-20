const Groq = require("groq-sdk");
require("dotenv").config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

exports.askQuestion = async (req, res) => {
  try {
    const { message } = req.body;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant for power plant related questions.",
        },
        {
          role: "user",
          content: message,
        },
      ],
      model: "llama-3.1-8b-instant", // ✅ UPDATED MODEL
    });

    const reply = chatCompletion.choices[0].message.content;

    return res.json({ reply });

  } catch (error) {
    console.error("Groq Error:", error);
    return res.status(500).json({
      reply: "Groq AI is currently unavailable. Please try again later.",
    });
  }
};
 