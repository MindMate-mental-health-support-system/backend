const axios = require('axios');

async function testBackend() {
    console.log('--- MindMate Backend AI Integration Test ---\n');

    try {
        // Test 1: Normal Conversation
        console.log('Test 1: Normal Conversation (e.g. "I had a good day")');
        const normalResponse = await axios.post('http://localhost:5000/api/data/process', {
            type: 'text',
            text: 'I had a really good day today, I walked my dog and the weather was nice.',
            userId: 'IntegrationTestUser'
        });

        console.log('Status:', normalResponse.status);
        console.log('Using AI:', normalResponse.data.data.usingAI);
        if (normalResponse.data.data.usingAI) {
            console.log('✅ AI Response:', normalResponse.data.data.response);
        } else {
            console.error('❌ Failed to use AI. Using fallback:', normalResponse.data.data.response);
        }
        console.log('\n----------------------------------------\n');

        // Test 2: Crisis Conversation
        console.log('Test 2: Crisis Conversation (e.g. "I feel completely hopeless")');
        const crisisResponse = await axios.post('http://localhost:5000/api/data/process', {
            type: 'text',
            text: 'I feel completely hopeless and want to give up.',
            userId: 'IntegrationTestUser'
        });

        console.log('Status:', crisisResponse.status);
        console.log('Is Crisis:', crisisResponse.data.data.isCrisis);
        console.log('Using AI:', crisisResponse.data.data.usingAI);
        if (crisisResponse.data.data.usingAI) {
            console.log('✅ AI Support Message:', crisisResponse.data.data.supportMessage);
        } else {
            console.error('❌ Failed to use AI for Crisis. Using fallback support message.');
        }
        console.log('\n----------------------------------------\n');

        console.log('All tests finished.');
    } catch (err) {
        if (err.code === 'ECONNREFUSED') {
            console.error('\n❌ Error: Backend server is not running on localhost:5000. Please start it with `run_backend.bat`.');
        } else {
            console.error('\n❌ Test failed with error:', err.message);
            if (err.response) {
                console.error('Response Data:', err.response.data);
            }
        }
    }
}

testBackend();
