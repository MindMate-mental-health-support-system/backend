const EmotionService = require('./services/emotionService');

(async () => {
    console.log("Testing Emotion ML Hugging Face Integration...");

    const phrases = [
        "I am so incredibly happy today!",
        "I feel terrible, everything is falling apart and I'm very sad.",
        "I'm so angry I could break something right now!",
        "What a wonderful surprise, thank you!"
    ];

    for (const phrase of phrases) {
        console.log(`\nTesting phrase: "${phrase}"`);
        const result = await EmotionService.detectTextEmotion(phrase);
        console.log(`Result:`, result);
    }
})();
