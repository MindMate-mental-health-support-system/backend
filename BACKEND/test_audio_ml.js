const fs = require('fs');
const path = require('path');
const TranscriptionService = require('./services/transcriptionService');
const EmotionService = require('./services/emotionService');

// Create a dummy audio file representing what Multer provides
const tempFilePath = path.join(__dirname, 'dummy_voice_msg.webm');
fs.writeFileSync(tempFilePath, 'dummy audio data');

const mockMulterFile = {
    path: tempFilePath,
    originalname: 'voice_message.webm',
    mimetype: 'audio/webm'
};

(async () => {
    console.log("=== Testing Backend Voice Pipeline ===");

    console.log("\n1. Testing Speech-To-Text (TranscriptionService)");
    const transcribedText = await TranscriptionService.transcribe(mockMulterFile);
    console.log(`Transcribed Output -> "${transcribedText}"`);

    console.log("\n2. Testing Speech Emotion Detection (EmotionService)");
    const emotionData = await EmotionService.detectVoiceEmotion(mockMulterFile);
    console.log(`Emotion Analysis Output ->`, emotionData);

    console.log("\nDone cleaning up!");
    fs.unlinkSync(tempFilePath);
})();
