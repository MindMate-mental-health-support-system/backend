const { GoogleGenAI } = require('@google/genai');
require('dotenv').config({ path: './.env', override: true });

async function testModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('❌ No GEMINI_API_KEY found in .env');
        return;
    }

    const ai = new GoogleGenAI({ apiKey });
    const modelsToTry = [
        'gemini-2.5-flash',
        'gemini-2.0-flash',
        'gemini-2.0-flash-lite',
        'gemini-1.5-flash',
        'gemini-1.5-flash-8b',
        'gemini-flash-latest'
    ];

    console.log('Testing Gemini Models on Free Tier:\\n');

    const workingModels = [];

    for (const model of modelsToTry) {
        try {
            process.stdout.write(`Testing ` + model + `... `);
            const startTime = Date.now();
            const response = await ai.models.generateContent({
                model: model,
                contents: 'Say hi.',
                config: { temperature: 0.1 }
            });
            const duration = Date.now() - startTime;
            console.log(`✅ SUCCESS (${duration}ms) - '` + response.text.trim() + `'`);
            workingModels.push(model);
        } catch (err) {
            console.log(`❌ FAILED: ` + err.message.split('\n')[0].substring(0, 150));
        }
    }

    console.log('\\n--- Summary ---');
    if (workingModels.length > 0) {
        console.log('✅ The following models are WORKING:');
        workingModels.forEach(m => console.log('  - ' + m));
        console.log('\\nYou can use any of these in your AI_MODEL config.');
    } else {
        console.log('❌ ALL models failed. This indicates a quota issue (429) or invalid API key.');
    }
}

testModels();
