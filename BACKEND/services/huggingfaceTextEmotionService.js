const { Client } = require('@gradio/client');

/**
 * HuggingFace Text Emotion Detection Service
 * 
 * Calls the HuggingFace Space: https://huggingface.co/spaces/sidharths9105/mindmate-emotion-detector
 * to detect emotions from text input
 */
class HuggingFaceTextEmotionService {
    static SPACE_ID = 'sidharths9105/mindmate-emotion-detector';
    static API_NAME = '/predict';

    /**
     * Analyze emotion from text
     * @param {string} text - Text to analyze for emotions
     * @returns {Promise<object>} - { emotion: string, confidence: number, scores: object }
     */
    static async analyzeText(text) {
        try {
            if (!text || typeof text !== 'string') {
                throw new Error('Text input is required and must be a string');
            }

            if (text.trim().length === 0) {
                throw new Error('Text cannot be empty');
            }

            console.log(`[HuggingFaceTextEmotion] Analyzing text via Gradio Client: "${text.substring(0, 50)}..."`);

            const client = await Client.connect(this.SPACE_ID);

            // Send to HuggingFace Space
            const response = await client.predict(this.API_NAME, {
                text: text
            });

            console.log(`[HuggingFaceTextEmotion] Response received:`, JSON.stringify(response.data));

            // Parse response
            const result = this.parseResponse(response.data);

            return result;

        } catch (error) {
            console.error('[HuggingFaceTextEmotion] Error analyzing text:', error.message);
            throw new Error(`Text emotion analysis failed: ${error.message}`);
        }
    }

    /**
     * Parse the HuggingFace Space response
     */
    static parseResponse(data) {
        if (!data || data.length === 0) {
            return { emotion: 'neutral', confidence: 0, scores: [], raw: data };
        }

        let prediction = data[0];
        if (Array.isArray(prediction) && prediction.length > 0) {
            prediction = prediction[0];
        }

        if (prediction && prediction.label) {
            return {
                emotion: prediction.label,
                confidence: prediction.score ?? prediction.confidence ?? (prediction.confidences ? prediction.confidences[0]?.confidence : 1.0),
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
     * Batch analyze multiple texts
     * @param {Array<string>} texts - Array of text strings
     * @returns {Promise<Array>} - Array of emotion results
     */
    static async analyzeMultiple(texts) {
        const results = [];
        for (const text of texts) {
            try {
                const result = await this.analyzeText(text);
                results.push({ text: text.substring(0, 100), ...result });
            } catch (error) {
                results.push({ text: text.substring(0, 100), error: error.message });
            }
        }
        return results;
    }

    /**
     * Get emotion emoji for display
     */
    static getEmoticonForEmotion(emotion) {
        const emoticons = {
            'happy': '😊',
            'joy': '😊',
            'sad': '😢',
            'sadness': '😢',
            'angry': '😠',
            'anger': '😠',
            'fear': '😨',
            'fearful': '😨',
            'disgust': '🤢',
            'disgusted': '🤢',
            'surprise': '😲',
            'surprised': '😲',
            'neutral': '😐'
        };

        return emoticons[emotion?.toLowerCase()] || '💭';
    }
}

module.exports = HuggingFaceTextEmotionService;
