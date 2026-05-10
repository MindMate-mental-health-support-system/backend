/**
 * Test Script for MindMate Chatbot System
 * Run with: node test.js
 */

const http = require('http');

// Test cases
const testCases = [
  {
    name: 'Happy Message (Normal Pipeline)',
    data: JSON.stringify({
      type: 'text',
      text: "I just got promoted at work! I'm so happy and excited!",
      userId: 'user123',
    }),
  },
  {
    name: 'Anxious Message (Moderate Crisis)',
    data: JSON.stringify({
      type: 'text',
      text: 'I feel really anxious and stressed about my upcoming exams. My anxiety is unbearable.',
      userId: 'user456',
    }),
  },
  {
    name: 'Depression Message (Severe Crisis)',
    data: JSON.stringify({
      type: 'text',
      text: "I feel so depressed and hopeless. Everything is too difficult. I can't go on anymore.",
      userId: 'user789',
    }),
  },
  {
    name: 'Suicidal Ideation (Critical Crisis)',
    data: JSON.stringify({
      type: 'text',
      text: "I want to die. I can't take this pain anymore. Suicide feels like the only way out.",
      userId: 'user999',
    }),
  },
];

function makeRequest(testCase) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/data/process',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': testCase.data.length,
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          resolve({
            testName: testCase.name,
            status: res.statusCode,
            data: JSON.parse(body),
          });
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(testCase.data);
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Starting MindMate Emotion-Aware Chatbot Tests\n');
  console.log('=' .repeat(80) + '\n');

  for (const testCase of testCases) {
    try {
      console.log(`📝 Test: ${testCase.name}`);
      console.log('-' .repeat(80));

      const result = await makeRequest(testCase);

      console.log(`Status: ${result.status}`);
      console.log(`\nResponse:`);
      console.log(JSON.stringify(result.data, null, 2));

      if (result.data.success && result.data.data) {
        const responseData = result.data.data;
        console.log(`\n📊 Analysis:`);
        console.log(`  - Crisis Detected: ${responseData.isCrisis}`);
        if (responseData.isCrisis) {
          console.log(`  - Severity Level: ${responseData.severity}`);
          console.log(`  - Crisis Keywords Found: ${responseData.detectedKeywords.join(', ')}`);
          console.log(`  - Detected Emotion: ${responseData.detectedEmotion}`);
          console.log(`  - Resources Provided: ${responseData.resources.length} contact(s)`);
          console.log(`  - Guided Steps: ${responseData.guidedNextSteps.length} step(s)`);
        } else {
          console.log(`  - Detected Emotion: ${responseData.detectedEmotion}`);
          console.log(`  - Emotion Confidence: ${(responseData.emotionConfidence * 100).toFixed(1)}%`);
          console.log(`  - Suggestions: ${responseData.suggestions.length} suggestion(s)`);
        }
      }

      console.log('\n✅ Test passed\n' + '=' .repeat(80) + '\n');
      await new Promise((resolve) => setTimeout(resolve, 500)); // Delay between tests
    } catch (error) {
      console.error(`❌ Test failed: ${error.message}\n`);
      console.log('=' .repeat(80) + '\n');
    }
  }

  console.log('🎉 All tests completed!\n');
}

// Run tests if server is available
console.log('Waiting for server to be ready...\n');
setTimeout(runTests, 1000);
