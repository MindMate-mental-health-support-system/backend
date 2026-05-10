const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini with the API key from .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate an empathetic response using Gemini 2.5 Flash
 * @param {string} transcript - The user's transcribed text
 * @param {string} emotion - The detected emotion
 * @returns {Promise<string>} The AI-generated response
 */
async function getGeminiResponse(transcript, emotion) {
  try {
    // Required by MVP specs: Use gemini-2.5-flash
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `The user said: "${transcript}". Their detected emotion is: "${emotion}". Provide a short, empathetic, and supportive response as an AI mental health companion. Do not be overly dramatic. Keep it concise.`;
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.error('[GeminiService] Error generating response:', err.message);
    // Required fallback response if Gemini fails
    return "I'm here with you. Tell me more.";
  }
}

module.exports = { getGeminiResponse };
