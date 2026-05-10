const axios = require('axios');

async function testTextEmotion() {
    console.log("=== Testing Text Emotion Detection ===");
    const endpoint = 'https://sidharths9105-mindmate-emotion-detector.hf.space/predict/';

    const phrases = [
        { lang: 'English', text: "I am feeling so wonderful today! Everything is great." },
        { lang: 'English', text: "This is the worst day of my life, I'm very sad." },
        { lang: 'Malayalam', text: "എനിക്ക് ഇന്ന് വളരെ സന്തോഷമുണ്ട്" },
        { lang: 'Malayalam', text: "എനിക്ക് വളരെ സങ്കടമുണ്ട്" },
        { lang: 'Hindi', text: "मैं आज बहुत खुश हूँ" },
        { lang: 'Hindi', text: "मुझे बहुत गुस्सा आ रहा है" }
    ];

    for (const item of phrases) {
        try {
            console.log(`\nTesting ${item.lang} phrase: "${item.text}"`);
            const formData = new FormData();

            // For Gradio, it could be JSON instead. Let's try JSON first if the space accepts it on /predict
            const response = await axios.post(
                endpoint,
                { data: [item.text] },
                {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 20000,
                }
            );
            console.log(`Result:`, response.data);
        } catch (error) {
            console.error(`Error for ${item.lang}:`, error.message);
        }
    }
}

testTextEmotion();
