const { Client, handle_file } = require("@gradio/client");

/**
 * HuggingFace Speech Emotion Recognition Service
 * 
 * Calls the HuggingFace Space: https://huggingface.co/spaces/sidharths9105/mindmate-ser
 * to detect emotions from audio files
 */
class HuggingFaceSERService {
    static SPACE_ID = 'sidharths9105/mindmate-ser';
    static API_NAME = '/predict_emotion';

    /**
     * Analyze emotion from an audio file
     * @param {object} audioFile - Multer file object (has .path, .originalname, .mimetype)
     * @returns {Promise<object>} - { emotion: string, confidence: number, scores: object }
     */
    static async analyzeEmotion(audioFile) {
        try {
            if (!audioFile || !audioFile.path) {
                throw new Error('Audio file is required');
            }

            console.log(`[HuggingFaceSER] Analyzing emotion from audio using Gradio Client: ${audioFile.originalname}`);

            // Connect to Gradio Client
            const client = await Client.connect(this.SPACE_ID);

            // Predict emotion via Gradio API using handle_file for file uploads
            const response = await client.predict(this.API_NAME, {
                audio: handle_file(audioFile.path)
            });

            console.log(`[HuggingFaceSER] Response received:`, JSON.stringify(response.data));

            // Parse response
            const result = this.parseResponse(response.data);

            return result;

        } catch (error) {
            console.error('[HuggingFaceSER] Error analyzing emotion:', error.message);
            throw new Error(`Emotion analysis failed: ${error.message}`);
        }
    }

    /**
     * Parse the HuggingFace Space response
     */
    static parseResponse(data) {
        if (!data || data.length === 0) {
            return { emotion: 'neutral', confidence: 0, scores: {}, raw: data };
        }

        const prediction = data[0];
        if (prediction && prediction.label) {
            return {
                emotion: prediction.label,
                confidence: prediction.confidences ? prediction.confidences[0]?.confidence : 1.0,
                scores: prediction.confidences || [],
                raw: data
            };
        }

        // Fallback
        return {
            emotion: 'neutral',
            confidence: 0,
            scores: [],
            raw: data
        };
    }

    /**
     * Batch analyze multiple emotions (for testing/development)
     * @param {Array<object>} audioFiles - Array of audio file objects
     * @returns {Promise<Array>} - Array of emotion results
     */
    static async analyzeMultiple(audioFiles) {
        const results = [];
        for (const file of audioFiles) {
            try {
                const result = await this.analyzeEmotion(file);
                results.push({ file: file.originalname, ...result });
            } catch (error) {
                results.push({ file: file.originalname, error: error.message });
            }
        }
        return results;
    }
}

module.exports = HuggingFaceSERService;
