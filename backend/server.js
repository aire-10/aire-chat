const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");

const app = express();

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.get("/", (req, res) => {
  res.send("Gemini backend is running 🚀");
});

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message || "";

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are Airé, a calm and supportive mental health chatbot.
Be empathetic, gentle, short, and warm.
Do not claim to be a therapist.
If the user sounds in immediate danger, encourage contacting local emergency or crisis support.

User message: ${userMessage}`,
    });

    res.json({
      reply: response.text || "I'm here for you 💚",
    });
  } catch (error) {
    console.error("Gemini error:", error);
    res.status(500).json({
      reply: "⚠️ Sorry, I couldn’t connect to Gemini right now.",
    });
  }
});

app.listen(3000, () => {
  console.log("Gemini server running on http://localhost:3000");
});