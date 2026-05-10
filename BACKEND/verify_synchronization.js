const EmotionService = require('./services/emotionService');
const CrisisDetectionService = require('./services/crisisDetectionService');

async function verify() {
    console.log('--- Verifying Emotion Service ---');
    const emotionsSet = new Set(['happy', 'sad', 'anxious', 'calm', 'excited', 'angry']);

    // Test Text Emotion Detection (Mock)
    console.log('Testing Text Emotions...');
    const testTexts = ['I am happy', 'So sad', 'I am angry', 'Very anxious', 'Feeling calm', 'Extremely excited', 'Something generic'];
    for (const text of testTexts) {
        const res = await EmotionService.detectTextEmotion(text);
        console.log(`Text: "${text}" -> Emotion: ${res.emotion} (${res.model})`);
        if (!emotionsSet.has(res.emotion)) {
            console.error(`❌ Unexpected emotion: ${res.emotion}`);
        }
    }

    // Test Voice Emotion Detection (Mock)
    console.log('\nTesting Voice Emotions (Random Mock)...');
    for (let i = 0; i < 5; i++) {
        const res = EmotionService.getMockVoiceEmotionResponse();
        console.log(`Voice Mock ${i + 1}: ${res.emotion}`);
        if (!emotionsSet.has(res.emotion)) {
            console.error(`❌ Unexpected emotion: ${res.emotion}`);
        }
    }

    console.log('\n--- Verifying Crisis Resources ---');
    const criticalResources = CrisisDetectionService.getResourcesForSeverity('CRITICAL');
    console.log('CRITICAL Resources:');
    criticalResources.forEach(r => console.log(`- ${r.name}: ${r.number}`));

    const hasTeleManas = criticalResources.some(r => r.name.includes('Tele-MANAS'));
    if (hasTeleManas) {
        console.log('✅ Indian resources (Tele-MANAS) confirmed.');
    } else {
        console.error('❌ Tele-MANAS not found in CRITICAL resources.');
    }

    console.log('\nVerification Complete.');
}

verify().catch(console.error);
