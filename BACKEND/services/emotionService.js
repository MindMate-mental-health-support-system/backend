const { Client, handle_file } = require('@gradio/client');

/**
 * Emotion Detection Service
 * Detects emotion from text and audio using Hugging Face Spaces (Gradio Client).
 */
class EmotionService {
  static getSpaceName() {
    const HF_API_URL = process.env.HF_API_URL || '';
    if (HF_API_URL.includes('sidharths9105/mindmate-emotion-detector')) {
        return 'sidharths9105/mindmate-emotion-detector';
    }
    return 'sidharths9105/mindmate-emotion-detector';
  }

  // Returns just the emotion string (used by chatRoutes.js MVP)
  static async detectEmotion(text) {
    const result = await EmotionService.detectTextEmotion(text);
    return result.emotion;
  }

  // Returns full object (used by dataRoutes.js)
  static async detectTextEmotion(text) {
    try {
      const spaceName = EmotionService.getSpaceName();
      console.log(`[EmotionService] Calling Hugging Face Space for TEXT: ${spaceName}...`);

      const client = await Client.connect(spaceName);
      const response = await client.predict("/predict", {
        text: text
      });

      let data = response.data;
      let result = data && data.length > 0 ? data[0] : null;
      if (Array.isArray(result) && result.length > 0) result = result[0];

      if (!result || (!result.label && !result.emotion)) {
          return { emotion: 'neutral', confidence: 0.5 };
      }
      
      let topEmotion = (result.label || result.emotion || 'neutral').toLowerCase();
      if (topEmotion === 'happy') topEmotion = 'joy';
      if (topEmotion === 'angry') topEmotion = 'anger';
      
      return {
        emotion: topEmotion,
        confidence: result.score ?? result.confidence ?? 0.8,
        model: 'HF_SPACE_TEXT'
      };
    } catch (error) {
      console.error('[EmotionService] Error detecting text emotion:', error.message);
      return { emotion: 'neutral', confidence: 0.5, model: 'FALLBACK' };
    }
  }

  // Returns full object (used by dataRoutes.js for voice)
  static async detectVoiceEmotion(audioFile) {
    try {
      const spaceName = 'sidharths9105/mindmate-ser';
      console.log(`[EmotionService] Calling Hugging Face Space for AUDIO: ${spaceName}...`);

      const client = await Client.connect(spaceName);
      
      // Send the audio file to Gradio using handle_file
      const response = await client.predict("/predict_emotion", {
        audio: handle_file(audioFile.path)
      });

      let data = response.data;
      let result = data && data.length > 0 ? data[0] : null;
      if (Array.isArray(result) && result.length > 0) result = result[0];

      if (!result || (!result.label && !result.emotion)) {
          return { emotion: 'neutral', confidence: 0.5 };
      }
      
      let topEmotion = (result.label || result.emotion || 'neutral').toLowerCase();
      if (topEmotion === 'happy') topEmotion = 'joy';
      if (topEmotion === 'angry') topEmotion = 'anger';
      
      console.log(`[EmotionService] Detected voice emotion: ${topEmotion}`);
      
      return {
        emotion: topEmotion,
        confidence: result.score ?? result.confidence ?? 0.8,
        model: 'HF_SPACE_AUDIO'
      };
    } catch (error) {
      console.error('[EmotionService] Error detecting voice emotion via Gradio:', error);
      if (error.response) {
         console.error('[EmotionService] Response Data:', error.response.data);
      }
      return {
        emotion: 'neutral',
        confidence: 0.5,
        model: 'FALLBACK',
        raw: { error: error.message }
      };
    }
  }
}

module.exports = EmotionService;
