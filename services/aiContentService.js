/**
 * AI Content Generation Service
 * Connects to local AI or remote API to generate dynamic responses
 * Formats prompts based on emotion, confidence, and crisis status
 */

const axios = require('axios');

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
      const aiResponse = await AIContentService.callAI(prompt);

      console.log('✓ AI response received');
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

    if (!isCrisis) {
      // NORMAL PIPELINE PROMPT
      prompt = `You are a supportive mental health chatbot assistant.

User Message: "${userMessage}"
Input Type: ${inputType}
Detected Emotion: ${emotion}
Confidence Score: ${(confidence * 100).toFixed(1)}%

Generate a warm, empathetic, and supportive response that:
1. Acknowledges their ${emotion} emotion
2. Validates their feelings
3. Provides practical, actionable advice
4. Asks a follow-up question to continue the conversation

Keep response concise (2-3 sentences max).
Make it personal and caring.`;
    } else {
      // CRISIS PIPELINE PROMPT
      prompt = `You are a compassionate crisis support assistant.

User Message: "${userMessage}"
Input Type: ${inputType}
Detected Emotion: ${emotion}
Crisis Severity: ${severity}

IMPORTANT: This is a CRISIS situation. Respond with:
1. Immediate empathy and concern
2. Validation of their pain
3. Motivational message about hope and recovery
4. Encouragement to seek professional help
5. Affirmation that they are not alone

Be urgent but calm. Show genuine care.
Keep response concise but impactful (3-4 sentences).
Include hope and recovery message.`;
    }

    return prompt;
  }

  /**
   * Call AI endpoint
   * Configure this based on your AI solution
   * Supports: Ollama (local), OpenAI, Hugging Face, etc.
   * @param {string} prompt - Prompt to send to AI
   * @returns {Promise<string>} AI response
   */
  static async callAI(prompt) {
    const AI_PROVIDER = process.env.AI_PROVIDER || 'ollama'; // ollama, openai, huggingface
    const AI_ENDPOINT = process.env.AI_ENDPOINT || 'http://localhost:11434/api/generate'; // Change based on provider
    const AI_MODEL = process.env.AI_MODEL || 'mistral'; // Change based on your model
    const AI_API_KEY = process.env.AI_API_KEY;

    try {
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
      const AI_PROVIDER = process.env.AI_PROVIDER || 'ollama';
      const AI_ENDPOINT =
        process.env.AI_ENDPOINT || 'http://localhost:11434/api/generate';

      if (AI_PROVIDER === 'ollama') {
        const response = await axios.get(
          AI_ENDPOINT.replace('/api/generate', '/api/tags'),
          { timeout: 5000 }
        );
        return response.status === 200;
      }

      return true; // Assume other APIs are available
    } catch (error) {
      console.warn('AI service not available:', error.message);
      return false;
    }
  }
}

module.exports = AIContentService;
