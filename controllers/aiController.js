import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Gemini
// Initialize Gemini inside controller to catch env vars at runtime

// @desc Generate Bio using AI
// @route POST /api/admin/generate-bio
export const generateBio = async (req, res) => {
  try {
    const { name, role, currentBio } = req.body;
    
    // Debug logging
    console.log("Generating bio for:", name, "Key available:", !!process.env.GEMINI_API_KEY);

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: "AI Service not configured (Missing API Key)" });
    }

    // Initialize inside handler to ensure env is ready
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Write a professional, engaging short bio (max 50 words) for an Event Management Admin named ${name}. 
    Role: ${role || "Admin"}. 
    ${currentBio ? `Context/Keywords to include: ${currentBio}` : ""}
    Tone: Professional, Efficient, and Welcoming. 
    Output only the bio text, no quotes.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("Bio generated successfully");
    res.json({ bio: text.trim() });
  } catch (error) {
    console.error("AI Generation Error Detailed:", JSON.stringify(error, null, 2));
    console.error("AI Error Message:", error.message);
    
    let errorMessage = "Failed to generate bio";
    if (error.message.includes("API key")) errorMessage = "Invalid API Key";
    if (error.message.includes("404")) errorMessage = "Model not found (try restarting)";
    
    res.status(500).json({ message: errorMessage, error: error.message });
  }
};
