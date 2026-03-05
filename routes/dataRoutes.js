const express = require('express');
const multer = require('multer');
const fs = require('fs');
const router = express.Router();

// Import services
const EmotionService = require('../services/emotionService');
const CrisisDetectionService = require('../services/crisisDetectionService');
const ResponseService = require('../services/responseService');
const AIContentService = require('../services/aiContentService');
const TranscriptionService = require('../services/transcriptionService');

// Configure multer for file uploads (for voice data)
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
});

/**
 * POST /api/data/process
 * Main endpoint for processing text or voice input
 * Detects emotion, checks for crisis indicators, and provides appropriate responses
 * 
 * Request body:
 * {
 *   type: 'text' | 'voice',
 *   text: string (required for text type),
 *   userId: string (optional, for tracking)
 * }
 * 
 * Files:
 * - voice: audio file (required for voice type)
 * 
 * Response:
 * {
 *   success: boolean,
 *   data: {
 *     isCrisis: boolean,
 *     severity?: 'CRITICAL' | 'SEVERE' | 'MODERATE',
 *     response: string,
 *     emotion: string,
 *     emotionConfidence: number,
 *     suggestions?: string[],
 *     followUpQuestions?: string[],
 *     resources?: object[],
 *     guidedNextSteps?: string[]
 *   }
 * }
 */
router.post('/process', upload.single('voice'), async (req, res) => {
  let uploadedFile = null;

  try {
    const { text, type, userId } = req.body;
    const voiceFile = req.file;

    // Validate input
    if (!type || !['text', 'voice'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: type must be "text" or "voice"',
      });
    }

    if (type === 'text' && !text) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: text is required for type "text"',
      });
    }

    if (type === 'voice' && !voiceFile) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: voice file is required for type "voice"',
      });
    }

    uploadedFile = voiceFile;
    let userText = '';
    let emotionData = null;

    // Step 1: Get emotion data based on input type
    console.log(`[${new Date().toISOString()}] Processing ${type} input for user: ${userId || 'anonymous'}`);

    if (type === 'text') {
      userText = text;
      emotionData = await EmotionService.detectTextEmotion(text);
      console.log('✓ Text emotion detected:', emotionData);
    } else if (type === 'voice') {
      // Step 1a: Transcribe audio to text (STT → feeds into AI + crisis pipeline)
      // Use text provided by the browser Web Speech API if available
      userText = text || await TranscriptionService.transcribe(voiceFile);
      console.log('✓ Audio transcribed (or provided by browser):', userText);

      // Step 1b: Run SED on the raw audio file for emotion
      emotionData = await EmotionService.detectVoiceEmotion(voiceFile);
      console.log('✓ Voice emotion detected (SED):', emotionData);
    }

    // Step 2: Detect crisis indicators
    const crisisAnalysis = CrisisDetectionService.detectCrisis(userText);
    console.log('✓ Crisis analysis completed:', crisisAnalysis);

    // Step 3: Check if AI is available and generate response
    const aiAvailable = await AIContentService.isAvailable();
    const isStreaming = req.query.stream === 'true';

    // Streaming setup if requested
    if (isStreaming) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();
    }

    const onChunk = isStreaming ? (chunk) => {
      res.write(`data: ${JSON.stringify({ type: 'chunk', text: chunk })}\n\n`);
    } : null;

    let aiResponse = null;

    if (crisisAnalysis.isCrisis) {
      // CRISIS PIPELINE
      console.log(`⚠️  CRISIS DETECTED - Severity: ${crisisAnalysis.severity}`);

      if (aiAvailable) {
        aiResponse = await AIContentService.generateContent({
          emotion: emotionData.emotion,
          confidence: emotionData.confidence,
          userMessage: userText,
          isCrisis: true,
          severity: crisisAnalysis.severity,
          inputType: type,
          onChunk
        });
      }

      responsePackage = CrisisDetectionService.getCrisisResponsePackage(
        userText,
        emotionData.emotion,
        crisisAnalysis.severity
      );

      // Add AI response to the package
      if (aiResponse) {
        responsePackage.aiGeneratedResponse = aiResponse;
        responsePackage.response = aiResponse; // Use same field for unity
        responsePackage.usingAI = true;
      } else {
        responsePackage.usingAI = false;
      }

      // Log crisis
      logCrisisEvent({
        userId: userId || 'anonymous',
        timestamp: new Date(),
        severity: crisisAnalysis.severity,
        keywords: crisisAnalysis.keywords,
        emotion: emotionData.emotion,
        type,
        aiUsed: !!aiResponse
      });

      if (isStreaming) {
        res.write(`data: ${JSON.stringify({ type: 'done', package: responsePackage })}\n\n`);
        return res.end();
      } else {
        return res.status(200).json({
          success: true,
          data: responsePackage,
        });
      }
    } else {
      // NORMAL PIPELINE
      console.log('✓ No crisis detected - Normal response pipeline');

      if (aiAvailable) {
        aiResponse = await AIContentService.generateContent({
          emotion: emotionData.emotion,
          confidence: emotionData.confidence,
          userMessage: userText,
          isCrisis: false,
          severity: null,
          inputType: type,
          onChunk
        });
      }

      responsePackage = ResponseService.generateNormalResponse(
        emotionData.emotion,
        emotionData.confidence,
        userText
      );

      // Replace static response with AI if available
      if (aiResponse) {
        responsePackage.response = aiResponse;
        responsePackage.usingAI = true;
      } else {
        responsePackage.usingAI = false;
      }

      if (isStreaming) {
        res.write(`data: ${JSON.stringify({ type: 'done', package: responsePackage })}\n\n`);
        return res.end();
      } else {
        return res.status(200).json({
          success: true,
          data: responsePackage,
        });
      }
    }
  } catch (error) {
    console.error('❌ Error processing request:', error);

    // Provide user-friendly error message
    const errorResponse = {
      success: false,
      error: 'Failed to process your message. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    };

    res.status(500).json(errorResponse);
  } finally {
    // Cleanup uploaded file
    if (uploadedFile && uploadedFile.path) {
      try {
        fs.unlink(uploadedFile.path, (err) => {
          if (err) console.error('Error cleaning up file:', err);
          else console.log('✓ Uploaded file cleaned up:', uploadedFile.path);
        });
      } catch (err) {
        console.error('Error in cleanup:', err);
      }
    }
  }
});

/**
 * GET /api/data/health
 * Health check endpoint for crisis system
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'operational',
    timestamp: new Date().toISOString(),
    services: {
      emotion_detection: process.env.TED_API_URL ? 'connected' : 'mock',
      voice_detection: process.env.SED_API_URL ? 'connected' : 'mock',
      crisis_detection: 'active',
    },
  });
});

/**
 * GET /api/data/resources
 * Get crisis resources for a specific severity level
 * Query params: ?severity=CRITICAL|SEVERE|MODERATE
 */
router.get('/resources', (req, res) => {
  const { severity } = req.query;

  if (!severity || !['CRITICAL', 'SEVERE', 'MODERATE'].includes(severity)) {
    return res.status(400).json({
      error: 'Invalid severity. Must be CRITICAL, SEVERE, or MODERATE',
    });
  }

  const resources = CrisisDetectionService.getResourcesForSeverity(severity);

  res.json({
    severity,
    resources,
    timestamp: new Date().toISOString(),
  });
});

/**
 * POST /api/data/process-with-ai
 * Enhanced endpoint that uses AI for content generation
 * Same input as /process but with dynamic AI-generated responses
 * 
 * Request body:
 * {
 *   type: 'text' | 'voice',
 *   text: string (required for text type),
 *   userId: string (optional)
 * }
 */
router.post('/process-with-ai', upload.single('voice'), async (req, res) => {
  let uploadedFile = null;

  try {
    const { text, type, userId } = req.body;
    const voiceFile = req.file;

    // Validate input
    if (!type || !['text', 'voice'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: type must be "text" or "voice"',
      });
    }

    if (type === 'text' && !text) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: text is required for type "text"',
      });
    }

    if (type === 'voice' && !voiceFile) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: voice file is required for type "voice"',
      });
    }

    uploadedFile = voiceFile;
    let userText = '';
    let emotionData = null;

    // Step 1: Get emotion data
    console.log(
      `[${new Date().toISOString()}] Processing ${type} input with AI for user: ${userId || 'anonymous'}`
    );

    if (type === 'text') {
      userText = text;
      emotionData = await EmotionService.detectTextEmotion(text);
      console.log('✓ Text emotion detected:', emotionData);
    } else if (type === 'voice') {
      // Step 1a: Transcribe audio to text (STT → feeds into AI + crisis pipeline)
      // Use text provided by the browser Web Speech API if available
      userText = text || await TranscriptionService.transcribe(voiceFile);
      console.log('✓ Audio transcribed (or provided by browser):', userText);

      // Step 1b: Run SED on the raw audio file for emotion
      emotionData = await EmotionService.detectVoiceEmotion(voiceFile);
      console.log('✓ Voice emotion detected (SED):', emotionData);
    }

    // Step 2: Detect crisis
    const crisisAnalysis = CrisisDetectionService.detectCrisis(userText);
    console.log('✓ Crisis analysis completed:', crisisAnalysis);

    // Step 3: Check if AI is available
    const aiAvailable = await AIContentService.isAvailable();
    console.log('🤖 AI Service available:', aiAvailable);

    // Step 3.5: Check if streaming is requested
    const isStreaming = req.query.stream === 'true';
    if (isStreaming) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();
    }

    // Streaming Helper
    const onChunk = isStreaming ? (chunk) => {
      res.write(`data: ${JSON.stringify({ type: 'chunk', text: chunk })}\n\n`);
    } : null;

    // Step 4: Generate response (with AI or fallback)
    let responsePackage;

    if (crisisAnalysis.isCrisis) {
      // CRISIS PIPELINE
      console.log(
        `⚠️  CRISIS DETECTED - Severity: ${crisisAnalysis.severity}`
      );

      // Try to get AI-generated response
      let aiResponse = null;
      if (aiAvailable) {
        aiResponse = await AIContentService.generateContent({
          emotion: emotionData.emotion,
          confidence: emotionData.confidence,
          userMessage: userText,
          isCrisis: true,
          severity: crisisAnalysis.severity,
          inputType: type,
          onChunk
        });
      }

      // Build crisis package
      responsePackage = CrisisDetectionService.getCrisisResponsePackage(
        userText,
        emotionData.emotion,
        crisisAnalysis.severity
      );

      // Add AI-generated response if available
      if (aiResponse) {
        responsePackage.aiGeneratedResponse = aiResponse;
        responsePackage.usingAI = true;
      } else {
        responsePackage.usingAI = false;
      }

      // Log crisis
      logCrisisEvent({
        userId: userId || 'anonymous',
        timestamp: new Date(),
        severity: crisisAnalysis.severity,
        keywords: crisisAnalysis.keywords,
        emotion: emotionData.emotion,
        type,
        aiUsed: !!aiResponse,
      });

      if (isStreaming) {
        res.write(`data: ${JSON.stringify({ type: 'done', package: responsePackage })}\n\n`);
        return res.end();
      } else {
        return res.status(200).json({
          success: true,
          data: responsePackage,
        });
      }
    } else {
      // NORMAL PIPELINE
      console.log('✓ No crisis detected - Normal pipeline with AI');

      // Try to get AI-generated response
      let aiResponse = null;
      if (aiAvailable) {
        aiResponse = await AIContentService.generateContent({
          emotion: emotionData.emotion,
          confidence: emotionData.confidence,
          userMessage: userText,
          isCrisis: false,
          severity: null,
          inputType: type,
          onChunk
        });
      }

      // Build normal response
      responsePackage = ResponseService.generateNormalResponse(
        emotionData.emotion,
        emotionData.confidence,
        userText
      );

      // Replace with AI-generated response if available
      if (aiResponse) {
        responsePackage.response = aiResponse;
        responsePackage.usingAI = true;
      } else {
        responsePackage.usingAI = false;
      }

      if (isStreaming) {
        res.write(`data: ${JSON.stringify({ type: 'done', package: responsePackage })}\n\n`);
        return res.end();
      } else {
        return res.status(200).json({
          success: true,
          data: responsePackage,
        });
      }
    }
  } catch (error) {
    console.error('❌ Error processing request:', error);

    const errorResponse = {
      success: false,
      error: 'Failed to process your message. Please try again.',
      details:
        process.env.NODE_ENV === 'development' ? error.message : undefined,
    };

    res.status(500).json(errorResponse);
  } finally {
    // Cleanup
    if (uploadedFile && uploadedFile.path) {
      try {
        fs.unlink(uploadedFile.path, (err) => {
          if (err) console.error('Error cleaning up file:', err);
          else console.log('✓ Uploaded file cleaned up:', uploadedFile.path);
        });
      } catch (err) {
        console.error('Error in cleanup:', err);
      }
    }
  }
});

/**
 * GET /api/data/ai-status
 * Check if AI service is available
 */
router.get('/ai-status', async (req, res) => {
  try {
    const aiAvailable = await AIContentService.isAvailable();

    res.json({
      aiAvailable,
      aiProvider: process.env.AI_PROVIDER || 'ollama',
      aiModel: process.env.AI_MODEL || 'mistral',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to check AI status',
      details:
        process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * Logging function for crisis events (for monitoring/alerts)
 * In production, this should log to a database or monitoring service
 */
function logCrisisEvent(eventData) {
  // TODO: Integrate with logging service (e.g., Winston, Bunyan)
  // TODO: Send alerts to crisis response team if CRITICAL severity
  console.log('📋 CRISIS EVENT LOG:', JSON.stringify(eventData, null, 2));
}

module.exports = router;