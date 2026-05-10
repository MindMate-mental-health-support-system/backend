const AIContentService = require('./aiContentService');

/**
 * Generate an empathetic response using the robust AI fallback system
 * @param {string} transcript - The user's transcribed text
 * @param {string} emotion - The detected emotion
 * @returns {Promise<string>} The AI-generated response
 */
async function getGeminiResponse(transcript, emotion) {
  try {
    const prompt = `The user said: "${transcript}". Their detected emotion is: "${emotion}". Provide a short, empathetic, and supportive response as an AI mental health companion. Do not be overly dramatic. Keep it concise.`;
    
    const result = await AIContentService.callAIWithFallback(prompt);
    if (result) {
        return result;
    }
    throw new Error('All AI providers failed');
  } catch (err) {
    console.error('[GeminiService] Error generating response:', err.message);
    // Required fallback response if AI fails
    return "I'm here with you. Tell me more.";
  }
}

module.exports = { getGeminiResponse };
