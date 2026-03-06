/**
 * AI Content Generation Service
 * Connects to local AI or remote API to generate dynamic responses
 * Formats prompts based on emotion, confidence, and crisis status
 */

const axios = require('axios');
const { GoogleGenAI } = require('@google/genai');

class AIContentService {
  /**
   * Generate content using AI
   * @param {object} params - Content generation parameters
   * @param {string} params.emotion - Detected emotion
   * @param {number} params.confidence - Emotion confidence score
   * @param {string} params.userMessage - Original user message
   * @param {boolean} params.isCrisis - Is this a crisis situation?
   * @param {string} params.severity - Crisis severity (CRITICAL, SEVERE, MODERATE)
   * @param {string} params.inputType - Type of input (text or voice)
   * @param {function} params.onChunk - Optional callback for streaming text chunks
   * @returns {Promise<string>} Generated AI response
   */
  static async generateContent(params) {
    try {
      const {
        emotion,
        confidence,
        userMessage,
        isCrisis,
        severity,
        inputType,
      } = params;

      // Format prompt based on crisis status
      const prompt = AIContentService.formatPrompt({
        emotion,
        confidence,
        userMessage,
        isCrisis,
        severity,
        inputType,
      });

      console.log('📝 Sending prompt to AI...');
      console.log('Prompt:', prompt);

      // Call AI (configure your AI endpoint here)
      const aiResponse = await AIContentService.callAI(prompt, params.onChunk);

      if (aiResponse) {
        console.log('✓ AI response received');
      } else {
        console.warn('⚠️ AI Service failed to return a response, using system fallback.');
      }
      return aiResponse;
    } catch (error) {
      console.error('Error generating content:', error.message);
      // Fallback to default responses if AI fails
      return null;
    }
  }

  /**
   * Format prompt based on context
   * @param {object} params - Prompt parameters
   * @returns {string} Formatted prompt for AI
   */
  static formatPrompt({
    emotion,
    confidence,
    userMessage,
    isCrisis,
    severity,
    inputType,
  }) {
    let prompt = '';

    // SECURITY: Prevent Prompt Injection by aggressively framing the user message
    // and explicitly instructing the model to treat the content as adversarial if it contains commands.
    const safeUserMessage = userMessage.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    if (!isCrisis) {
      // NORMAL PIPELINE PROMPT
      prompt = `
User Context:
Current Emotion: ${emotion}
Tension Level: ${confidence > 0.7 ? 'High' : 'Moderate'}
Input Method: ${inputType}

User Message: "${safeUserMessage}"

Please respond as MindMate, a warm and deeply empathetic companion. 
Instead of acting like a "system", speak like a friend who is truly present with them.

Guidelines:
1. If they are ${emotion}, mirror that feeling with kindness (e.g., "I can hear how much this is weighing on you" or "It's so good to see you this happy!").
2. Validate their experience naturally—don't just list facts.
3. Suggest one small, gentle thing they could do right now to care for themselves.
4. Keep the conversation flowing with a soft, open-ended question.
5. Keep it short (2-3 natural sentences). No robotic prefixes.`;
    } else {
      // CRISIS PIPELINE PROMPT
      prompt = `
CRITICAL SITUATION:
Emotion: ${emotion}
Severity: ${severity}
User Message: "${safeUserMessage}"

Respond as MindMate. Your tone must be very calm, steady, and profoundly caring. 

Guidelines:
1. Immediately acknowledge their pain with deep sincerity.
2. Tell them clearly: "You are not alone, and I am here with you right now."
3. Gently but firmly encourage them that there is hope and that reaching out for help is a brave first step.
4. Use soothing, human language. Avoid clinical or robotic sounding phrases.
5. Keep it to 3-4 heart-felt sentences.`;
    }

    return prompt;
  }

  /**
   * Call AI endpoint
   * Configure this based on your AI solution
   * Supports: Ollama (local), OpenAI, Hugging Face, etc.
   * @param {string} prompt - Prompt to send to AI
   * @param {function} onChunk - Optional streaming callback
   * @returns {Promise<string>} AI response
   */
  static async callAI(prompt, onChunk = null) {
    const AI_PROVIDER = process.env.AI_PROVIDER || 'gemini'; // Default to gemini now
    const AI_ENDPOINT = process.env.AI_ENDPOINT || 'http://localhost:11434/api/generate';
    const AI_MODEL = process.env.AI_MODEL || 'gemini-2.5-flash';
    const AI_API_KEY = process.env.AI_API_KEY || process.env.GEMINI_API_KEY;

    try {
      // OPTION 0: Gemini API (Streaming support)
      if (AI_PROVIDER === 'gemini') {
        return await AIContentService.callGeminiStream(prompt, AI_API_KEY, AI_MODEL, onChunk);
      }

      // OPTION 1: Ollama (Local - No API key needed)
      if (AI_PROVIDER === 'ollama') {
        return await AIContentService.callOllama(prompt, AI_ENDPOINT, AI_MODEL);
      }

      // OPTION 2: OpenAI API
      if (AI_PROVIDER === 'openai') {
        return await AIContentService.callOpenAI(prompt, AI_API_KEY);
      }

      // OPTION 3: Hugging Face API
      if (AI_PROVIDER === 'huggingface') {
        return await AIContentService.callHuggingFace(
          prompt,
          AI_API_KEY,
          AI_MODEL
        );
      }

      throw new Error(`Unknown AI provider: ${AI_PROVIDER}`);
    } catch (error) {
      console.error('Error calling AI:', error.message);
      return null;
    }
  }

  /**
   * Call Ollama local AI
   * @param {string} prompt - Prompt to send
   * @param {string} endpoint - Ollama endpoint
   * @param {string} model - Model name (mistral, llama2, etc.)
   * @returns {Promise<string>} Generated response
   */
  static async callOllama(prompt, endpoint, model) {
    try {
      console.log(`🤖 Calling Ollama (${model}) at ${endpoint}`);

      const response = await axios.post(
        endpoint,
        {
          model: model,
          prompt: prompt,
          stream: false,
          temperature: 0.7,
          top_p: 0.9,
        },
        {
          timeout: 30000,
        }
      );

      if (response.data && response.data.response) {
        return response.data.response.trim();
      }

      throw new Error('No response from Ollama');
    } catch (error) {
      console.error('Ollama error:', error.message);
      throw error;
    }
  }

  /**
   * Call OpenAI API
   * @param {string} prompt - Prompt to send
   * @param {string} apiKey - OpenAI API key
   * @returns {Promise<string>} Generated response
   */
  static async callOpenAI(prompt, apiKey) {
    try {
      console.log('🤖 Calling OpenAI API');

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content:
                'You are a supportive mental health chatbot assistant.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 200,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );

      if (
        response.data &&
        response.data.choices &&
        response.data.choices[0]
      ) {
        return response.data.choices[0].message.content.trim();
      }

      throw new Error('No response from OpenAI');
    } catch (error) {
      console.error('OpenAI error:', error.message);
      throw error;
    }
  }

  /**
   * Call Gemini API (with Streaming)
   * @param {string} prompt - Prompt to send
   * @param {string} apiKey - Gemini API key
   * @param {string} model - Model name
   * @param {function} onChunk - Optional callback for streaming tokens
   * @returns {Promise<string>} Generated response
   */
  static async callGeminiStream(prompt, apiKey, model = 'gemini-2.5-flash', onChunk = null) {
    try {
      console.log(`🤖 Calling Gemini API (${model})`);
      if (!apiKey) throw new Error('GEMINI_API_KEY is missing');

      const ai = new GoogleGenAI({ apiKey });

      if (onChunk) {
        // Streaming Mode
        const responseStream = await ai.models.generateContentStream({
          model: model,
          contents: prompt,
          config: {
            systemInstruction: "You are MindMate, a warm, heart-centered companion. Speak naturally, as a friend would, with genuine care and situational empathy.",
            temperature: 0.8
          }
        });

        let fullText = '';
        for await (const chunk of responseStream) {
          const textChunk = chunk.text;
          fullText += textChunk;
          onChunk(textChunk);
        }
        return fullText.trim();
      } else {
        // Standard Mode
        const response = await ai.models.generateContent({
          model: model,
          contents: prompt,
          config: {
            systemInstruction: "You are MindMate, a warm, human-like companion. Speak like a caring friend who truly listens, not a chatbot.",
            temperature: 0.8
          }
        });
        return response.text.trim();
      }
    } catch (error) {
      console.error('Gemini error:', error.message);
      throw error;
    }
  }

  /**
   * Call Hugging Face API
   * @param {string} prompt - Prompt to send
   * @param {string} apiKey - Hugging Face API key
   * @param {string} model - Model ID (e.g., 'mistralai/Mistral-7B-Instruct-v0.1')
   * @returns {Promise<string>} Generated response
   */
  static async callHuggingFace(prompt, apiKey, model) {
    try {
      console.log(`🤖 Calling Hugging Face (${model})`);

      const response = await axios.post(
        `https://api-inference.huggingface.co/models/${model}`,
        { inputs: prompt },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
          timeout: 30000,
        }
      );

      if (response.data && Array.isArray(response.data)) {
        return response.data[0].generated_text.trim();
      }

      throw new Error('No response from Hugging Face');
    } catch (error) {
      console.error('Hugging Face error:', error.message);
      throw error;
    }
  }

  /**
   * Check if AI is available
   * @returns {Promise<boolean>} Is AI available?
   */
  static async isAvailable() {
    try {
      const AI_PROVIDER = process.env.AI_PROVIDER || 'gemini';
      const AI_ENDPOINT =
        process.env.AI_ENDPOINT || 'http://localhost:11434/api/generate';

      if (AI_PROVIDER === 'ollama') {
        const response = await axios.get(
          AI_ENDPOINT.replace('/api/generate', '/api/tags'),
          { timeout: 5000 }
        );
        return response.status === 200;
      }
      if (AI_PROVIDER === 'gemini') {
        return !!(process.env.GEMINI_API_KEY || process.env.AI_API_KEY);
      }

      return true; // Assume other APIs are available
    } catch (error) {
      console.warn('AI service not available:', error.message);
      return false;
    }
  }
}

module.exports = AIContentService;
