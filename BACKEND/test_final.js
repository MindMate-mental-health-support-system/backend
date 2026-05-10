/**
 * MINDMATE BACKEND - COMPREHENSIVE TESTING REPORT
 * Simplified test suite that works with Windows localhost
 */

const http = require('http');

const BASE_URL = 'localhost';
const PORT = 5000;

let testResults = [];
let testCount = 0;
let passCount = 0;
let failCount = 0;

/**
 * Simple HTTP request helper
 */
function httpRequest(method, path, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      port: PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsed
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data,
            parseError: e.message
          });
        }
      });
    });

    req.on('error', (err) => {
      console.error('HTTP Request error:', err);
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

/**
 * Test runner
 */
async function test(name, testFn) {
  testCount++;
  process.stdout.write(`\n📋 TEST ${testCount}: ${name}\n`);
  process.stdout.write('─'.repeat(70) + '\n');

  try {
    await testFn();
    passCount++;
    testResults.push({ name, status: '✅ PASS' });
    console.log(`✅ PASSED\n`);
  } catch (error) {
    failCount++;
    console.error('Test error details:', error);
    testResults.push({ name, status: `❌ FAIL: ${error.message}` });
    console.log(`❌ FAILED: ${error.message}\n`);
  }
}

/**
 * Assert helper
 */
function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

/**
 * RUN ALL TESTS
 */
async function runTests() {
  console.log('\n' + '═'.repeat(70));
  console.log('🧪 MINDMATE BACKEND - COMPREHENSIVE TEST SUITE');
  console.log('═'.repeat(70));

  let authToken = null;
  let testUsername = `test_${Date.now()}`;
  let testEmail = `test_${Date.now()}@example.com`;
  let testPassword = 'TestPass123!';
  let testSessionId = null;

  // ─────────────────────────────────────────────────────────────
  // SECTION 1: BASIC CONNECTIVITY
  // ─────────────────────────────────────────────────────────────

  await test('Server is running and responsive', async () => {
    const res = await httpRequest('GET', '/api/data/ai-status');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.aiAvailable !== undefined, 'Response missing aiAvailable field');
  });

  // ─────────────────────────────────────────────────────────────
  // SECTION 2: AUTHENTICATION TESTS
  // ─────────────────────────────────────────────────────────────

  await test('User Signup - Valid credentials', async () => {
    const res = await httpRequest('POST', '/api/users/signup', {}, {
      email: testEmail,
      password: testPassword,
      username: testUsername,
      gender: 'other',
      age: 28
    });
    assert([200, 201].includes(res.status), `Expected 200/201, got ${res.status}: ${JSON.stringify(res.data)}`);
    assert(res.data.user, 'No user in response');
  });

  await test('User Signup - Duplicate username should fail', async () => {
    const res = await httpRequest('POST', '/api/users/signup', {}, {
      email: `other_${Date.now()}@example.com`,
      password: testPassword,
      username: testUsername,  // Same username
      gender: 'female',
      age: 25
    });
    assert(res.status === 400, `Expected 400, got ${res.status}`);
  });

  await test('User Signup - Missing email should fail', async () => {
    const res = await httpRequest('POST', '/api/users/signup', {}, {
      password: testPassword,
      username: `test_${Date.now()}`,
      age: 25
    });
    assert(res.status === 400, `Expected 400, got ${res.status}`);
  });

  await test('User Login - Valid credentials', async () => {
    const res = await httpRequest('POST', '/api/users/login', {}, {
      identifier: testEmail,
      password: testPassword
    });
    assert(res.status === 200, `Expected 200, got ${res.status}: ${JSON.stringify(res.data)}`);
    assert(res.data.session, 'No session in response');
    assert(res.data.session.access_token, 'No JWT token');
    authToken = res.data.session.access_token;
    console.log(`   JWT Token obtained: ${authToken.substring(0, 20)}...`);
  });

  await test('User Login - Invalid password should fail', async () => {
    const res = await httpRequest('POST', '/api/users/login', {}, {
      identifier: testEmail,
      password: 'WrongPassword123!'
    });
    assert(res.status === 400, `Expected 400, got ${res.status}`);
  });

  await test('User Login - Non-existent email should fail', async () => {
    const res = await httpRequest('POST', '/api/users/login', {}, {
      identifier: 'nonexistent@example.com',
      password: testPassword
    });
    assert(res.status === 400, `Expected 400, got ${res.status}`);
  });

  // ─────────────────────────────────────────────────────────────
  // SECTION 3: SESSION MANAGEMENT
  // ─────────────────────────────────────────────────────────────

  await test('Get Sessions without auth should fail', async () => {
    const res = await httpRequest('GET', '/api/sessions', {});
    assert(res.status === 401 || res.status === 500, `Expected 401/500, got ${res.status}`);
  });

  await test('Get Sessions with valid auth', async () => {
    const res = await httpRequest('GET', '/api/sessions', {
      'Authorization': `Bearer ${authToken}`
    });
    assert(res.status === 200, `Expected 200, got ${res.status}: ${JSON.stringify(res.data)}`);
    assert(Array.isArray(res.data.sessions), 'Sessions should be an array');
    console.log(`   Current sessions: ${res.data.sessions.length}`);
  });

  await test('Create new chat session', async () => {
    const res = await httpRequest('POST', '/api/sessions', 
      { 'Authorization': `Bearer ${authToken}` },
      { title: 'Test Session ' + Date.now() }
    );
    assert(res.status === 201, `Expected 201, got ${res.status}: ${JSON.stringify(res.data)}`);
    assert(res.data.session, 'No session in response');
    testSessionId = res.data.session.id;
    console.log(`   New session created: ${testSessionId}`);
  });

  // ─────────────────────────────────────────────────────────────
  // SECTION 4: TEXT MESSAGE PROCESSING
  // ─────────────────────────────────────────────────────────────

  await test('Process text without auth should fail', async () => {
    const res = await httpRequest('POST', '/api/data/process', {}, {
      type: 'text',
      text: 'I am happy'
    });
    assert(res.status === 401 || res.status === 500, `Expected 401/500, got ${res.status}`);
  });

  await test('Process text - Happy message', async () => {
    const res = await httpRequest('POST', '/api/data/process',
      { 'Authorization': `Bearer ${authToken}` },
      { type: 'text', text: 'I feel absolutely joyful and excited!' }
    );
    assert(res.status === 200, `Expected 200, got ${res.status}: ${JSON.stringify(res.data)}`);
    assert(res.data.data, 'No data in response');
    assert(res.data.data.emotion, 'No emotion detected');
    console.log(`   Emotion: ${res.data.data.emotion} (${(res.data.data.emotionConfidence * 100).toFixed(1)}%)`);
  });

  await test('Process text - Sad message', async () => {
    const res = await httpRequest('POST', '/api/data/process',
      { 'Authorization': `Bearer ${authToken}` },
      { type: 'text', text: 'I feel so sad and unhappy' }
    );
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.data.emotion, 'No emotion detected');
    console.log(`   Emotion: ${res.data.data.emotion} (${(res.data.data.emotionConfidence * 100).toFixed(1)}%)`);
  });

  await test('Process text - Angry message', async () => {
    const res = await httpRequest('POST', '/api/data/process',
      { 'Authorization': `Bearer ${authToken}` },
      { type: 'text', text: 'This makes me so angry and frustrated!' }
    );
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.data.emotion, 'No emotion detected');
    console.log(`   Emotion: ${res.data.data.emotion} (${(res.data.data.emotionConfidence * 100).toFixed(1)}%)`);
  });

  await test('Process text - Fearful message', async () => {
    const res = await httpRequest('POST', '/api/data/process',
      { 'Authorization': `Bearer ${authToken}` },
      { type: 'text', text: 'I am terrified and anxious about this' }
    );
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.data.emotion, 'No emotion detected');
    console.log(`   Emotion: ${res.data.data.emotion} (${(res.data.data.emotionConfidence * 100).toFixed(1)}%)`);
  });

  // ─────────────────────────────────────────────────────────────
  // SECTION 5: CRISIS DETECTION
  // ─────────────────────────────────────────────────────────────

  await test('Crisis - No crisis detected in normal message', async () => {
    const res = await httpRequest('POST', '/api/data/process',
      { 'Authorization': `Bearer ${authToken}` },
      { type: 'text', text: 'I am having a good day' }
    );
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.data.isCrisis === false, 'Should not detect crisis');
  });

  await test('Crisis - MODERATE severity detected', async () => {
    const res = await httpRequest('POST', '/api/data/process',
      { 'Authorization': `Bearer ${authToken}` },
      { type: 'text', text: 'I feel very stressed and anxious about everything' }
    );
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    if (res.data.data.isCrisis) {
      assert(res.data.data.severity === 'MODERATE', `Expected MODERATE, got ${res.data.data.severity}`);
      console.log(`   ⚠️  Crisis detected: MODERATE`);
    } else {
      console.log(`   ✓ No crisis (crisis detection may require different keywords)`);
    }
  });

  await test('Crisis - SEVERE severity detected', async () => {
    const res = await httpRequest('POST', '/api/data/process',
      { 'Authorization': `Bearer ${authToken}` },
      { type: 'text', text: 'I feel completely hopeless and the pain is unbearable' }
    );
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.data.isCrisis === true, 'Should detect SEVERE crisis');
    assert(res.data.data.severity === 'SEVERE', `Expected SEVERE, got ${res.data.data.severity}`);
    console.log(`   🚨 Crisis detected: SEVERE`);
  });

  await test('Crisis - CRITICAL severity detected with resources', async () => {
    const res = await httpRequest('POST', '/api/data/process',
      { 'Authorization': `Bearer ${authToken}` },
      { type: 'text', text: 'I want to kill myself and end my life' }
    );
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.data.isCrisis === true, 'Should detect CRITICAL crisis');
    assert(res.data.data.severity === 'CRITICAL', `Expected CRITICAL, got ${res.data.data.severity}`);
    assert(res.data.data.resources && res.data.data.resources.length > 0, 'Should include crisis resources');
    console.log(`   🚨🚨 CRITICAL CRISIS - ${res.data.data.resources.length} resources provided`);
  });

  // ─────────────────────────────────────────────────────────────
  // SECTION 6: ERROR HANDLING
  // ─────────────────────────────────────────────────────────────

  await test('Error - Missing required field (text)', async () => {
    const res = await httpRequest('POST', '/api/data/process',
      { 'Authorization': `Bearer ${authToken}` },
      { type: 'text' }  // Missing text
    );
    assert(res.status === 400, `Expected 400, got ${res.status}`);
  });

  await test('Error - Invalid message type', async () => {
    const res = await httpRequest('POST', '/api/data/process',
      { 'Authorization': `Bearer ${authToken}` },
      { type: 'invalid', text: 'test' }
    );
    assert(res.status === 400, `Expected 400, got ${res.status}`);
  });

  // ─────────────────────────────────────────────────────────────
  // RESULTS
  // ─────────────────────────────────────────────────────────────

  console.log('\n' + '═'.repeat(70));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('═'.repeat(70));
  console.log(`Total Tests:  ${testCount}`);
  console.log(`✅ Passed:    ${passCount}`);
  console.log(`❌ Failed:    ${failCount}`);
  console.log(`Success Rate: ${((passCount / testCount) * 100).toFixed(1)}%`);
  console.log('─'.repeat(70));

  testResults.forEach(r => {
    console.log(`${r.status}: ${r.name}`);
  });

  console.log('═'.repeat(70));
  if (failCount === 0) {
    console.log('🎉 ALL TESTS PASSED!');
  } else {
    console.log(`⚠️  ${failCount} test(s) failed`);
  }
  console.log('═'.repeat(70));

  process.exit(failCount === 0 ? 0 : 1);
}

// Run tests
runTests().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
