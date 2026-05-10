const path = require('path');
const fs = require('fs');
const HuggingFaceTextEmotionService = require('./services/huggingfaceTextEmotionService');
const HuggingFaceSERService = require('./services/huggingfaceSERService');

async function testAll() {
    console.log("=== Testing HuggingFace Text Emotion Service ===");
    const phrases = [
        { lang: 'English', text: "I am feeling so wonderful today! Everything is great." },
        { lang: 'Malayalam', text: "എനിക്ക് ഇന്ന് വളരെ സന്തോഷമുണ്ട്" },
        { lang: 'Hindi', text: "मैं आज बहुत खुश हूँ" }
    ];

    for (const item of phrases) {
        try {
            console.log(`\nTesting ${item.lang} phrase: "${item.text}"`);
            const result = await HuggingFaceTextEmotionService.analyzeText(item.text);
            console.log(`Result: Emotion=${result.emotion}, Confidence=${(result.confidence * 100).toFixed(1)}%`);
        } catch (error) {
            console.error(`Error for ${item.lang}:`, error.message);
        }
    }

    console.log("\n=== Testing HuggingFace Speech Emotion Service ===");
    // Create a dummy audio file representing what Multer provides
    const tempFilePath = path.join(__dirname, 'dummy_voice_msg.wav');
    // Using a valid dummy wav format structure if the API checks, otherwise just some bytes
    // Since it's going to a real HF space, the space will probably fail parsing dummy bytes as wav, 
    // but the API connection will succeed, returning an error or fallback label. Let's write a small valid empty wav header or just dummy bytes.
    fs.writeFileSync(tempFilePath, 'dummy audio data');

    const mockMulterFile = {
        path: tempFilePath,
        originalname: 'voice_message.wav',
        mimetype: 'audio/wav'
    };

    try {
        console.log(`\nTesting Dummy Audio File... Note: Emotion output might be neutral/error due to dummy bytes, but looking for successful API response shape.`);
        const result = await HuggingFaceSERService.analyzeEmotion(mockMulterFile);
        console.log(`Result: Emotion=${result.emotion}, Confidence=${(result.confidence * 100).toFixed(1)}%`);
    } catch (err) {
        console.error("Audio Analysis Error:", err.message);
    }

    fs.unlinkSync(tempFilePath);
}

testAll();
