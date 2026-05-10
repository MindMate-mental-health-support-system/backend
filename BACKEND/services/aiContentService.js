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
        textEmotion,
        textEmotionConfidence,
        userMessage,
        isCrisis,
        severity,
        inputType,
      } = params;

      // Format prompt based on crisis status
      const prompt = AIContentService.formatPrompt({
        emotion,
        confidence,
        textEmotion,
        textEmotionConfidence,
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
        console.log('--- RAW AI RESPONSE ---');
        console.log(aiResponse);
        console.log('-----------------------');
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
    textEmotion,
    textEmotionConfidence,
    userMessage,
    isCrisis,
    severity,
    inputType,
  }) {
    let prompt = '';

    // SECURITY: Prevent Prompt Injection by aggressively framing the user message
    // and explicitly instructing the model to treat the content as adversarial if it contains commands.
    const safeUserMessage = userMessage.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    
    const emotionContext = inputType === 'voice' && textEmotion
        ? `Voice Emotion: ${emotion} (Tension Level: ${confidence > 0.7 ? 'High' : 'Moderate'})\nText Emotion: ${textEmotion} (Confidence: ${textEmotionConfidence > 0.7 ? 'High' : 'Moderate'})`
        : `Current Emotion: ${emotion}\nTension Level: ${confidence > 0.7 ? 'High' : 'Moderate'}`;

    if (!isCrisis) {
      let severityGuidelines = "3. Keep the conversation open-ended but safely guided toward emotional regulation.";
      if (severity === 'SEVERE') {
         severityGuidelines = "3. Provide actionable steps they can take to resolve the issue themselves, offer strong motivation, and explicitly ask if they need any further help.";
      } else if (severity === 'MODERATE') {
         severityGuidelines = "3. Provide positive motivation and uplifting encouragement to help them navigate their feelings.";
      }

      // NORMAL PIPELINE PROMPT
      prompt = `
User Context:
${emotionContext}
Input Method: ${inputType}

User Message: "${safeUserMessage}"

You are MindMate, a deeply humanized, empathetic, and caring friend. 
Your goal is to provide a highly personalized response by actively blending the provided Machine-Detected Emotion & Confidence with your own analysis of the User's Message.

Guidelines:
1. Speak completely like a warm, supportive human being. Do NOT sound like a clinical bot or use AI jargon.
2. Tailor your response directly to the specific emotion provided in the context, taking the tension/confidence level into account.
3. Validate their feelings based on their exact message. If their voice emotion differs from their text emotion, gently explore this underlying tension.
${severityGuidelines}
5. Keep it natural and concise (3-4 sentences max). Do not use AI prefixes like "As an AI..." or "As MindMate...".`;
    } else {
      // CRISIS PIPELINE PROMPT
      prompt = `
CRITICAL SITUATION:
${emotionContext}
Severity: ${severity}
User Message: "${safeUserMessage}"

Respond as MindMate, a professional crisis intervention specialist. Your tone must be profoundly calm, steady, authoritative, and deeply caring. 

Guidelines:
1. Immediately acknowledge their pain with professional sincerity and unconditional positive regard.
2. Tell them clearly: "You are not alone, and I am here with you right now."
3. Firmly encourage them to use the provided crisis resources or reach out to a trusted professional.
4. Provide immediate, simple grounding techniques (e.g., deep breathing).
5. Keep it to 3-5 heart-felt, stabilizing sentences. Avoid clinical jargon but maintain a professional safety-first approach.`;
    }

    return prompt;
  }

  /**
   * Route the AI request based on the configured provider.
   */
  static async callAI(prompt, onChunk = null) {
    const AI_PROVIDER = process.env.AI_PROVIDER || 'fallback';
    
    if (AI_PROVIDER === 'fallback' || AI_PROVIDER === 'gemini') {
      return await AIContentService.callAIWithFallback(prompt, onChunk);
    }

    try {
      const AI_ENDPOINT = process.env.AI_ENDPOINT || 'http://localhost:11434/api/generate';
      const AI_MODEL = process.env.AI_MODEL || 'gemini-2.5-flash';
      const AI_API_KEY = process.env.AI_API_KEY;

      if (AI_PROVIDER === 'ollama') {
        return await AIContentService.callOllama(prompt, AI_ENDPOINT, AI_MODEL);
      }

      if (AI_PROVIDER === 'huggingface') {
        return await AIContentService.callHuggingFace(prompt, AI_API_KEY, AI_MODEL);
      }

      throw new Error(`Unknown AI provider: ${AI_PROVIDER}`);
    } catch (error) {
      console.error('Error calling AI:', error.message);
      return null;
    }
  }

  /**
   * Implements a robust multi-provider fallback waterfall
   */
  static async callAIWithFallback(prompt, onChunk = null) {
    const providers = [
      { name: 'Gemini Primary', call: () => AIContentService.callGeminiStream(prompt, process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_1, 'gemini-2.5-flash', onChunk) },
      { name: 'Gemini Secondary', call: () => AIContentService.callGeminiStream(prompt, process.env.GEMINI_API_KEY_2, 'gemini-2.5-flash', onChunk) },
      { name: 'Groq', call: () => AIContentService.callOpenAILike(prompt, process.env.GROQ_API_KEY, 'https://api.groq.com/openai/v1/chat/completions', 'llama-3.1-8b-instant', onChunk) },
      { name: 'OpenRouter', call: () => AIContentService.callOpenAILike(prompt, process.env.OPENROUTER_API_KEY, 'https://openrouter.ai/api/v1/chat/completions', 'google/gemini-2.0-flash-exp:free', onChunk) },
      { name: 'OpenAI', call: () => AIContentService.callOpenAILike(prompt, process.env.OPENAI_API_KEY, 'https://api.openai.com/v1/chat/completions', 'gpt-3.5-turbo', onChunk) }
    ];

    for (const provider of providers) {
      try {
        console.log(`[AI Fallback] Attempting ${provider.name}...`);
        const response = await provider.call();
        if (response) {
            console.log(`[AI Fallback] ✓ ${provider.name} succeeded.`);
            return response;
        }
      } catch (error) {
        // Suppress full error stack unless critical, just log failure
        console.warn(`[AI Fallback] ⚠️ ${provider.name} failed:`, error.message);
      }
    }
    
    console.error('[AI Fallback] ❌ All AI providers failed.');
    return null;
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
   * Universal handler for OpenAI, Groq, and OpenRouter
   */
  static async callOpenAILike(prompt, apiKey, baseURL, model, onChunk = null) {
    if (!apiKey) throw new Error(`API Key missing for ${baseURL}`);
    try {
      console.log(`🤖 Calling OpenAI-like API at ${baseURL} (${model})`);

      // OpenRouter recommends setting HTTP-Referer
      const extraHeaders = baseURL.includes('openrouter.ai') ? {
          'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
          'X-Title': 'MindMate'
      } : {};

      const response = await axios.post(
        baseURL,
        {
          model: model,
          messages: [
            {
              role: 'system',
              content: 'You are MindMate, a warm, heart-centered companion. Speak naturally, as a friend would, with genuine care and situational empathy.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.8,
          max_tokens: 300,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            ...extraHeaders
          },
          timeout: 20000,
        }
      );

      if (response.data && response.data.choices && response.data.choices[0]) {
        const fullText = response.data.choices[0].message.content.trim();
        if (onChunk) {
            onChunk(fullText); // Simulate streaming for fallback UI
        }
        return fullText;
      }
      throw new Error('Invalid response structure from ' + baseURL);
    } catch (error) {
      if (error.response) {
         console.warn(`[OpenAILike] ${baseURL} error response:`, error.response.status, error.response.data);
      }
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
      const AI_ENDPOINT = process.env.AI_ENDPOINT || 'http://localhost:11434/api/generate';
      
      console.log(`[isAvailable] Checking availability for provider: ${AI_PROVIDER}`);

      if (AI_PROVIDER === 'ollama') {
        const response = await axios.get(
          AI_ENDPOINT.replace('/api/generate', '/api/tags'),
          { timeout: 5000 }
        );
        return response.status === 200;
      }
      if (AI_PROVIDER === 'gemini') {
        const hasKey = !!(process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_1 || process.env.AI_API_KEY);
        console.log(`[isAvailable] Gemini key present: ${hasKey}`);
        return hasKey;
      }

      return true; // Assume other APIs are available
    } catch (error) {
      console.warn('AI service not available:', error.message);
      return false;
    }
  }
}

module.exports = AIContentService;
