const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

/**
 * Transcription Service (Speech-to-Text / STT)
 *
 * Converts an audio file into text using either:
 *  - A configured STT_API_URL endpoint (Whisper-compatible REST API)
 *  - A simple fallback placeholder when no API is configured (for dev/testing)
 *
 * Environment variables:
 *  STT_API_URL   - URL of your Whisper-compatible STT endpoint
 *                  e.g. https://api.openai.com/v1/audio/transcriptions
 *  STT_API_KEY   - API key (required for OpenAI Whisper; optional for local servers)
 *  STT_MODEL     - Model name (default: whisper-1)
 *  STT_LANGUAGE  - Optional ISO language code (e.g. 'en', 'ml'). Omit to auto-detect.
 */
class TranscriptionService {
    /**
     * Transcribe an audio file to text.
     * @param {object} audioFile - Multer file object (has .path and .originalname/.mimetype)
     * @returns {Promise<string>} Transcribed text
     */
    static async transcribe(audioFile) {
        const STT_API_URL = process.env.STT_API_URL;
        const STT_API_KEY = process.env.STT_API_KEY;
        const STT_MODEL = process.env.STT_MODEL || 'whisper-1';
        const STT_LANGUAGE = process.env.STT_LANGUAGE; // optional

        if (!STT_API_URL) {
            console.warn('[TranscriptionService] STT_API_URL not set. Using mock transcription.');
            return TranscriptionService.getMockTranscription();
        }

        try {
            console.log(`[TranscriptionService] Transcribing audio via ${STT_API_URL}`);

            const form = new FormData();
            form.append('file', fs.createReadStream(audioFile.path), {
                filename: audioFile.originalname || 'audio.webm',
                contentType: audioFile.mimetype || 'audio/webm',
            });
            form.append('model', STT_MODEL);

            if (STT_LANGUAGE) {
                form.append('language', STT_LANGUAGE);
            }

            const headers = {
                ...form.getHeaders(),
            };

            if (STT_API_KEY) {
                headers['Authorization'] = `Bearer ${STT_API_KEY}`;
            }

            const response = await axios.post(STT_API_URL, form, {
                headers,
                timeout: 30000, // 30s – audio files can take a moment
            });

            // OpenAI Whisper returns { text: "..." }
            // Many compatible servers also return { text: "..." }
            const transcript =
                response.data?.text ||
                response.data?.transcript ||
                response.data?.result ||
                '';

            if (!transcript) {
                console.warn('[TranscriptionService] Empty transcript returned from STT API.');
                return TranscriptionService.getMockTranscription();
            }

            console.log(`[TranscriptionService] ✓ Transcript: "${transcript}"`);
            return transcript.trim();
        } catch (error) {
            console.error('[TranscriptionService] STT API error:', error.message);
            console.warn('[TranscriptionService] Falling back to mock transcription.');
            return TranscriptionService.getMockTranscription();
        }
    }

    /**
     * Mock transcription for development (when STT_API_URL is not set).
     * Returns a placeholder that lets the rest of the pipeline still run.
     */
    static getMockTranscription() {
        return '[Voice message – transcription unavailable. Set STT_API_URL in .env to enable.]';
    }
}

module.exports = TranscriptionService;
