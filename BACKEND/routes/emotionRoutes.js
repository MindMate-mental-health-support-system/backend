const express = require('express');
const multer = require('multer');
const HuggingFaceSERService = require('../services/huggingfaceSERService');
const HuggingFaceTextEmotionService = require('../services/huggingfaceTextEmotionService');

const router = express.Router();

// Configure multer for audio file uploads
const upload = multer({
    storage: multer.memoryStorage(), // Store in memory (faster for small files)
    limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
    fileFilter: (req, file, cb) => {
        // Accept audio files
        if (file.mimetype.startsWith('audio/')) {
            cb(null, true);
        } else {
            cb(new Error('Only audio files are allowed'));
        }
    }
});

/**
 * POST /api/emotion/analyze-audio
 * Analyze emotion from uploaded audio file
 * 
 * Body: multipart/form-data
 *   - audio: file (required) - Audio file (wav, mp3, webm, etc.)
 * 
 * Response:
 *   {
 *     emotion: "happy|sad|angry|neutral|fearful|disgusted|surprised",
 *     confidence: 0.95,
 *     scores: { happy: 0.95, sad: 0.02, ... },
 *     analysisTimestamp: "2024-01-15T10:30:45Z"
 *   }
 */
router.post('/analyze-audio', upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No audio file provided' });
        }

        console.log(`[EmotionRoutes] Analyzing audio: ${req.file.originalname}`);

        // Create a temporary file object that mimics multer file structure
        // since we used memoryStorage, we need to create a readable stream
        const audioFileForService = {
            path: req.file.buffer,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            buffer: req.file.buffer, // Store buffer for service to use
            size: req.file.size
        };

        // Analyze emotion using HuggingFace Space
        const emotionResult = await HuggingFaceSERService.analyzeEmotion(audioFileForService);

        res.status(200).json({
            emotion: emotionResult.emotion,
            confidence: emotionResult.confidence,
            scores: emotionResult.scores,
            analysisTimestamp: new Date().toISOString(),
            message: 'Emotion analyzed successfully'
        });

    } catch (error) {
        console.error('[EmotionRoutes] Error:', error.message);
        res.status(500).json({
            error: error.message,
            message: 'Failed to analyze emotion'
        });
    }
});

/**
 * POST /api/emotion/analyze-audio-buffer
 * Analyze emotion from base64 encoded audio (alternative method)
 * 
 * Body: JSON
 *   - audioBase64: string - Base64 encoded audio data
 *   - fileName: string (optional) - Original filename
 * 
 * Response: Same as /analyze-audio
 */
router.post('/analyze-audio-buffer', async (req, res) => {
    try {
        const { audioBase64, fileName } = req.body;

        if (!audioBase64) {
            return res.status(400).json({ error: 'No audioBase64 provided' });
        }

        console.log(`[EmotionRoutes] Analyzing base64 audio: ${fileName || 'unknown'}`);

        // Convert base64 to buffer
        const audioBuffer = Buffer.from(audioBase64, 'base64');

        // Create file object
        const audioFileForService = {
            path: audioBuffer,
            originalname: fileName || 'audio.wav',
            mimetype: 'audio/wav',
            buffer: audioBuffer,
            size: audioBuffer.length
        };

        const emotionResult = await HuggingFaceSERService.analyzeEmotion(audioFileForService);

        res.status(200).json({
            emotion: emotionResult.emotion,
            confidence: emotionResult.confidence,
            scores: emotionResult.scores,
            analysisTimestamp: new Date().toISOString(),
            message: 'Emotion analyzed successfully'
        });

    } catch (error) {
        console.error('[EmotionRoutes] Error:', error.message);
        res.status(500).json({
            error: error.message,
            message: 'Failed to analyze emotion'
        });
    }
});

/**
 * GET /api/emotion/health
 * Check if HuggingFace Space is accessible
 */
router.get('/health', async (req, res) => {
    try {
        // Try a simple HTTP GET to check if the space is running
        const axios = require('axios');
        await axios.get('https://sidharths9105-mindmate-ser.hf.space/info/');
        
        res.status(200).json({
            status: 'ok',
            message: 'HuggingFace SER Space is accessible',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(503).json({
            status: 'error',
            message: 'HuggingFace SER Space is not accessible',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * POST /api/emotion/analyze-text
 * Analyze emotion from text input
 * 
 * Body: JSON
 *   - text: string (required) - Text to analyze
 * 
 * Response:
 *   {
 *     emotion: "happy|sad|angry|neutral|fearful|disgusted|surprised",
 *     confidence: 0.95,
 *     scores: { happy: 0.95, sad: 0.02, ... },
 *     analysisTimestamp: "2024-01-15T10:30:45Z"
 *   }
 */
router.post('/analyze-text', async (req, res) => {
    try {
        const { text } = req.body;

        if (!text || typeof text !== 'string') {
            return res.status(400).json({ error: 'Text input is required and must be a string' });
        }

        if (text.trim().length === 0) {
            return res.status(400).json({ error: 'Text cannot be empty' });
        }

        console.log(`[EmotionRoutes] Analyzing text: ${text.substring(0, 50)}...`);

        // Analyze emotion using HuggingFace Space
        const emotionResult = await HuggingFaceTextEmotionService.analyzeText(text.trim());

        res.status(200).json({
            emotion: emotionResult.emotion,
            confidence: emotionResult.confidence,
            scores: emotionResult.scores,
            analysisTimestamp: new Date().toISOString(),
            message: 'Text emotion analyzed successfully'
        });

    } catch (error) {
        console.error('[EmotionRoutes] Text analysis error:', error.message);
        res.status(500).json({
            error: error.message,
            message: 'Failed to analyze text emotion'
        });
    }
});

module.exports = router;
