import express from "express";
import fetch from "node-fetch";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Hugging Face (emotion detection)
const HF_API_URL =
  "https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base";

async function detectEmotion(text) {
  try {
    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: text }),
    });

    const result = await response.json();
    return Array.isArray(result) && result[0] ? result[0].label : "neutral";
  } catch {
    return "neutral";
  }
}

// --- Provider Chain ---
async function callGemini(systemPrompt, message) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const response = await model.generateContent([systemPrompt, message]);
    return response.response.text();
  } catch (err) {
    console.error("Gemini failed:", err.message);
    return null;
  }
}

async function callGroq(systemPrompt, message) {
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
      }),
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (err) {
    console.error("Groq failed:", err.message);
    return null;
  }
}

async function callOpenRouter(systemPrompt, message) {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistralai/mixtral-8x7b-instruct",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
      }),
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (err) {
    console.error("OpenRouter failed:", err.message);
    return null;
  }
}

// --- Chatbot Route ---
router.post("/", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const emotion = await detectEmotion(message);

    const systemPrompt = `
You are StreakBuddy 🤖, a fun, witty, and supportive AI friend inside StreakMates.
The user is currently feeling: ${emotion}.

- Reply short and casual, like a real friend.
- Use emojis naturally, but not too much.
- If sad/angry → be empathetic.
- If happy/excited → be playful and encouraging.
- Always keep tone human and friendly.
`;

    // Fallback chain
    let reply =
      (await callGemini(systemPrompt, message)) ||
      (await callGroq(systemPrompt, message)) ||
      (await callOpenRouter(systemPrompt, message)) ||
      "⚠️ Sorry, I’m having trouble right now.";

    res.json({ success: true, emotion, reply });
  } catch (err) {
    console.error("Chatbot Error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

export default router;
