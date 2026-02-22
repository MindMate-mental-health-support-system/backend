const axios = require('axios');

/**
 * Emotion Detection Service
 * Integrates with ML models (TED - Text Emotion Detection, SED - Speech Emotion Detection)
 */

class EmotionService {
  /**
   * Detect emotion from text using TED (Text Emotion Detection)
   * @param {string} text - Input text to analyze
   * @returns {Promise<{emotion: string, confidence: number, model: string}>}
   */
  static async detectTextEmotion(text) {
    try {
      const TED_API_URL = process.env.TED_API_URL;
      const TED_API_KEY = process.env.TED_API_KEY;

      if (!TED_API_URL) {
        console.warn('TED_API_URL not configured, using mock response');
        return EmotionService.getMockTextEmotionResponse(text);
      }

      const response = await axios.post(
        TED_API_URL,
        { text },
        {
          headers: {
            'Authorization': `Bearer ${TED_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 5000,
        }
      );

      return {
        emotion: response.data.emotion || 'neutral',
        confidence: response.data.confidence || 0.8,
        model: 'TED',
        raw: response.data,
      };
    } catch (error) {
      console.error('Error in text emotion detection:', error.message);
      console.warn('Falling back to mock emotion response');
      // Fall back to mock instead of throwing error
      return EmotionService.getMockTextEmotionResponse(text);
    }
  }

  /**
   * Detect emotion from audio using SED (Speech Emotion Detection)
   * @param {object} audioFile - Multer file object
   * @returns {Promise<{emotion: string, confidence: number, model: string}>}
   */
  static async detectVoiceEmotion(audioFile) {
    try {
      const SED_API_URL = process.env.SED_API_URL;
      const SED_API_KEY = process.env.SED_API_KEY;

      if (!SED_API_URL) {
        console.warn('SED_API_URL not configured, using mock response');
        return EmotionService.getMockVoiceEmotionResponse();
      }

      // Create form data for file upload
      const FormData = require('form-data');
      const fs = require('fs');
      const form = new FormData();

      form.append('file', fs.createReadStream(audioFile.path));

      const response = await axios.post(SED_API_URL, form, {
        headers: {
          ...form.getHeaders(),
          'Authorization': `Bearer ${SED_API_KEY}`,
        },
        timeout: 10000,
      });

      return {
        emotion: response.data.emotion || 'neutral',
        confidence: response.data.confidence || 0.75,
        model: 'SED',
        raw: response.data,
      };
    } catch (error) {
      console.error('Error in voice emotion detection:', error.message);
      console.warn('Falling back to mock emotion response');
      // Fall back to mock instead of throwing error
      return EmotionService.getMockVoiceEmotionResponse();
    }
  }

  /**
   * Mock response for text emotion detection (development/testing)
   */
  static getMockTextEmotionResponse(text) {
    const emotionMap = {
      happy: { emotion: 'happy', confidence: 0.92 },
      sad: { emotion: 'sad', confidence: 0.88 },
      angry: { emotion: 'angry', confidence: 0.85 },
      anxious: { emotion: 'anxious', confidence: 0.80 },
      neutral: { emotion: 'neutral', confidence: 0.75 },
    };

    // Simple keyword-based mock
    for (const [key, value] of Object.entries(emotionMap)) {
      if (text.toLowerCase().includes(key)) {
        return {
          emotion: value.emotion,
          confidence: value.confidence,
          model: 'TED_MOCK',
          raw: { text, detected_keyword: key },
        };
      }
    }

    return {
      emotion: 'neutral',
      confidence: 0.60,
      model: 'TED_MOCK',
      raw: { text },
    };
  }

  /**
   * Mock response for voice emotion detection (development/testing)
   */
  static getMockVoiceEmotionResponse() {
    const emotions = ['happy', 'sad', 'anxious', 'calm', 'neutral'];
    const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    
    return {
      emotion: randomEmotion,
      confidence: Math.random() * 0.3 + 0.65, // 0.65 to 0.95
      model: 'SED_MOCK',
      raw: { note: 'Mock voice emotion response' },
    };
  }
}

module.exports = EmotionService;
