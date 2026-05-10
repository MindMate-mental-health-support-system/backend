const express = require('express');
const { detectEmotion } = require('../services/emotionService');
const { getGeminiResponse } = require('../services/geminiService');

const router = express.Router();

router.post('/chat', async (req, res) => {
  try {
    const { transcript, emotion } = req.body;
    if (!transcript) return res.status(400).json({ error: 'Transcript required' });

    // Detect emotion if not explicitly provided
    const detectedEmotion = emotion || await detectEmotion(transcript);
    
    // Get AI empathetic response
    const aiResponse = await getGeminiResponse(transcript, detectedEmotion);

    res.json({ response: aiResponse, emotion: detectedEmotion });
  } catch (err) {
    console.error('[Chat] Error:', err.message);
    res.json({ response: "I'm here with you. Tell me more.", emotion: 'neutral' });
  }
});

module.exports = router;
