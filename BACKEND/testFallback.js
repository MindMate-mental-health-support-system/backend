require('dotenv').config();
const AIContentService = require('./services/aiContentService.js');

async function testFallbacks() {
    console.log('\n--- TESTING MULTI-PROVIDER AI FALLBACK ---\n');

    const originalGemini1 = process.env.GEMINI_API_KEY_1;
    const originalGemini2 = process.env.GEMINI_API_KEY_2;
    const originalGroq = process.env.GROQ_API_KEY;
    const originalOpenRouter = process.env.OPENROUTER_API_KEY;

    // Test 1: Gemini Primary works
    console.log('=== TEST 1: Normal Operation (Gemini Primary) ===');
    let response = await AIContentService.callAIWithFallback('Reply with exactly "Hello World 1"');
    console.log('Response:', response, '\n');

    // Test 2: Gemini Primary fails, Gemini Secondary works
    console.log('=== TEST 2: Gemini Primary Fails -> Gemini Secondary ===');
    process.env.GEMINI_API_KEY_1 = 'invalid_key';
    response = await AIContentService.callAIWithFallback('Reply with exactly "Hello World 2"');
    console.log('Response:', response, '\n');

    // Test 3: Both Gemini fail, Groq works
    console.log('=== TEST 3: Both Gemini Fail -> Groq ===');
    process.env.GEMINI_API_KEY_2 = 'invalid_key';
    response = await AIContentService.callAIWithFallback('Reply with exactly "Hello World 3"');
    console.log('Response:', response, '\n');

    // Test 4: Gemini & Groq fail, OpenRouter works
    console.log('=== TEST 4: Gemini & Groq Fail -> OpenRouter ===');
    process.env.GROQ_API_KEY = 'invalid_key';
    response = await AIContentService.callAIWithFallback('Reply with exactly "Hello World 4"');
    console.log('Response:', response, '\n');

    // Test 5: Everything fails except OpenAI
    console.log('=== TEST 5: Everything Fails -> OpenAI ===');
    process.env.OPENROUTER_API_KEY = 'invalid_key';
    response = await AIContentService.callAIWithFallback('Reply with exactly "Hello World 5"');
    console.log('Response:', response, '\n');
    
    console.log('--- TESTING COMPLETE ---');
}

testFallbacks().catch(console.error);
