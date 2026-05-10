const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
let token = '';
let userId = '';
let sessionId = '';

async function runTests() {
    console.log('--- STARTING BACKEND INTEGRATION TEST ---');

    // Generate random credentials to avoid conflicts
    const randomNum = Math.floor(Math.random() * 100000);
    const username = `testuser_${randomNum}`;
    const email = `test_${randomNum}@example.com`;
    const password = 'Test@Password123!';

    try {
        // 1. Test Signup
        console.log(`\n[1/5] Testing Signup with ${email}...`);
        let res = await axios.post(`${BASE_URL}/api/users/signup`, {
            email,
            password,
            username,
            gender: 'other',
            age: 25
        });
        console.log(`✅ Signup SUCCESS. User ID: ${res.data.user.id}`);

        // 2. Test Login
        console.log(`\n[2/5] Testing Login...`);
        res = await axios.post(`${BASE_URL}/api/users/login`, {
            identifier: email,
            password
        });
        token = res.data.session.access_token;
        userId = res.data.user.id;
        console.log(`✅ Login SUCCESS. Token received.`);

        // 3. Create Chat Session
        console.log(`\n[3/5] Creating Chat Session...`);
        res = await axios.post(
            `${BASE_URL}/api/sessions`,
            { title: 'Automated Test Session' },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        sessionId = res.data.session.id;
        console.log(`✅ Session Created. Session ID: ${sessionId}`);

        // 4. Test Chat Processing (AI + Emotion pipeline)
        console.log(`\n[4/5] Testing Data Processing Pipeline (Custom Emotion Model + Normal AI)...`);
        const testText = "I feel so happy and excited today!";
        res = await axios.post(`${BASE_URL}/api/data/process-with-ai`, {
            type: 'text',
            text: testText,
            userId: userId
        });
        console.log(`✅ Data Processed.`);
        console.log(`   🔸 Detected Emotion: ${res.data.data.detectedEmotion} (Confidence: ${res.data.data.emotionConfidence})`);
        console.log(`   🔸 Final AI Response: ${res.data.data.response}`);

        // 5. Test Saving Message to History
        console.log(`\n[5/5] Saving message to session history...`);
        const message_data = [
            { sender: 'user', text: testText, timestamp: new Date() },
            { sender: 'bot', text: res.data.data.response, timestamp: new Date() }
        ];
        res = await axios.post(
            `${BASE_URL}/api/sessions/${sessionId}/messages`,
            { message_data, mood: 'happy' },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(`✅ History saved.`);

        console.log('\n--- ALL TESTS PASSED SUCCESSFULLY! ---');
    } catch (error) {
        console.error('\n❌ TEST FAILED!');
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error('Response:', error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

runTests();
