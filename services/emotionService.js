const axios = require('axios');

// ─────────────────────────────────────────────────────────────────────────────
// Custom Hugging Face Spaces emotion detector endpoint.
// Override with TED_API_URL in .env to use a different endpoint.
// ─────────────────────────────────────────────────────────────────────────────
const HF_EMOTION_URL =
  'https://sidharths9105-mindmate-emotion-detector.hf.space/run/predict';

/**
 * Emotion Detection Service
 * Primary: Custom HF Spaces emotion model  (text)
 * Secondary: SED API for voice (if configured), else mock
 */
class EmotionService {
  /**
   * Detect emotion from text using the custom HF Spaces model.
   * Falls back to mock when the API is unreachable.
   * @param {string} text
   * @returns {Promise<{emotion: string, confidence: number, model: string}>}
   */
  static async detectTextEmotion(text) {
    // Allow override via env
    const endpoint = process.env.TED_API_URL || HF_EMOTION_URL;

    try {
      console.log(`[EmotionService] Calling emotion API: ${endpoint}`);

      const response = await axios.post(
        endpoint,
        { data: [text] },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 20000, // HF Spaces cold-start can be slow
        }
      );

      // HF Gradio returns: { data: [{ label, score }] }
      const result = response.data?.data?.[0];

      if (!result) {
        console.warn('[EmotionService] Unexpected response shape, falling back to mock');
        return EmotionService.getMockTextEmotionResponse(text);
      }

      // Normalise label to lowercase (e.g. "Joy" -> "joy")
      let emotion = (result.label || result.emotion || 'sad').toLowerCase();
      if (emotion === 'angry') emotion = 'anger';
      if (emotion === 'happy') emotion = 'joy';
      const confidence = result.score ?? result.confidence ?? 0.8;

      console.log(`[EmotionService] ✓ Emotion: ${emotion} (${(confidence * 100).toFixed(1)}%)`);

      return {
        emotion,
        confidence,
        model: 'HF_CUSTOM',
        raw: result,
      };
    } catch (error) {
      console.error('[EmotionService] Emotion API error:', error.message);
      console.warn('[EmotionService] Falling back to mock response');
      return EmotionService.getMockTextEmotionResponse(text);
    }
  }

  /**
   * Detect emotion from audio using SED (Speech Emotion Detection).
   * Falls back to mock when SED_API_URL is not configured.
   * @param {object} audioFile - Multer file object
   * @returns {Promise<{emotion: string, confidence: number, model: string}>}
   */
  static async detectVoiceEmotion(audioFile) {
    const SED_API_URL = process.env.SED_API_URL;
    const SED_API_KEY = process.env.SED_API_KEY;

    if (!SED_API_URL) {
      console.warn('[EmotionService] SED_API_URL not set, using mock voice emotion');
      return EmotionService.getMockVoiceEmotionResponse();
    }

    try {
      const FormData = require('form-data');
      const fs = require('fs');
      const form = new FormData();
      form.append('file', fs.createReadStream(audioFile.path));

      const response = await axios.post(SED_API_URL, form, {
        headers: {
          ...form.getHeaders(),
          ...(SED_API_KEY ? { Authorization: `Bearer ${SED_API_KEY}` } : {}),
        },
        timeout: 10000,
      });

      let emotion = (response.data.emotion || response.data.label || 'sad').toLowerCase();
      if (emotion === 'angry') emotion = 'anger';
      if (emotion === 'happy') emotion = 'joy';

      return {
        emotion,
        confidence: response.data.confidence ?? response.data.score ?? 0.75,
        model: 'SED',
        raw: response.data,
      };
    } catch (error) {
      console.error('[EmotionService] SED API error:', error.message);
      return EmotionService.getMockVoiceEmotionResponse();
    }
  }

  // ──────────────────────── Mock helpers ────────────────────────

  static getMockTextEmotionResponse(text) {
    const emotionMap = {
      sadness: { words: ['sad', 'sadness', 'depressed', 'down', 'upset', 'hate', 'bad'], confidence: 0.88 },
      joy: { words: ['happy', 'joy', 'excited', 'great', 'awesome', 'puppy'], confidence: 0.92 },
      love: { words: ['love', 'care', 'affection', 'sweet'], confidence: 0.95 },
      anger: { words: ['anger', 'angry', 'mad', 'furious', 'annoyed'], confidence: 0.85 },
      fear: { words: ['fear', 'anxious', 'scared', 'worried', 'nervous'], confidence: 0.80 },
      surprise: { words: ['surprise', 'shocked', 'unexpected', 'wow'], confidence: 0.88 },
    };

    const lower = text.toLowerCase();
    for (const [emotion, data] of Object.entries(emotionMap)) {
      for (const word of data.words) {
        if (lower.includes(word)) {
          return { emotion, confidence: data.confidence, model: 'MOCK_TED', raw: { text } };
        }
      }
    }

    return { emotion: 'sadness', confidence: 0.60, model: 'MOCK_TED', raw: { text } };
  }

  static getMockVoiceEmotionResponse() {
    const emotions = ['sadness', 'joy', 'love', 'anger', 'fear', 'surprise'];
    return {
      emotion: emotions[Math.floor(Math.random() * emotions.length)],
      confidence: Math.random() * 0.3 + 0.65,
      model: 'MOCK_SED',
      raw: { note: 'Mock voice emotion – set SED_API_URL to use a real model' },
    };
  }
}

module.exports = EmotionService;
