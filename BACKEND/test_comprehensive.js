/**
 * Comprehensive Testing Suite for MindMate Backend
 * Tests all API endpoints and core functionality
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
let testResults = [];
let authToken = null;
let testUserId = null;
let testSessionId = null;

// Test counter
let testCount = 0;
let passCount = 0;
let failCount = 0;

/**
 * Helper function to make API requests
 */
async function apiRequest(method, path, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${path}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return {
      success: true,
      status: response.status,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status || 0,
      error: error.response?.data || error.message
    };
  }
}

/**
 * Test runner
 */
async function test(name, testFn) {
  testCount++;
  console.log(`\n📋 TEST ${testCount}: ${name}`);
  console.log('─'.repeat(70));

  try {
    await testFn();
    passCount++;
    testResults.push({ name, status: '✅ PASS' });
    console.log(`✅ PASSED`);
  } catch (error) {
    failCount++;
    testResults.push({ name, status: `❌ FAIL - ${error.message}` });
    console.log(`❌ FAILED: ${error.message}`);
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
 * Run all tests
 */
async function runTests() {
  console.log('\n' + '═'.repeat(70));
  console.log('🧪 MINDMATE BACKEND COMPREHENSIVE TEST SUITE');
  console.log('═'.repeat(70));

  // ─────────────────────────────────────────────────────────────
  // SECTION 1: BASIC CONNECTIVITY
  // ─────────────────────────────────────────────────────────────

  await test('Server is running', async () => {
    const result = await apiRequest('GET', '/api/data/ai-status');
    assert(result.success, 'Server not responding');
  });

  // ─────────────────────────────────────────────────────────────
  // SECTION 2: AUTHENTICATION
  // ─────────────────────────────────────────────────────────────

  let testUsername = `testuser_${Date.now()}`;
  let testEmail = `test_${Date.now()}@example.com`;
  let testPassword = 'TestPassword123!';

  await test('User Signup - Valid', async () => {
    const result = await apiRequest('POST', '/api/users/signup', {
      email: testEmail,
      password: testPassword,
      username: testUsername,
      gender: 'male',
      age: 25
    });
    
    assert(result.status === 201 || result.status === 200, `Expected 201/200, got ${result.status}: ${JSON.stringify(result.error)}`);
    assert(result.data.user, 'No user returned');
    testUserId = result.data.user.id;
  });

  await test('User Signup - Duplicate Username (should fail)', async () => {
    const result = await apiRequest('POST', '/api/users/signup', {
      email: `duplicate_${Date.now()}@example.com`,
      password: testPassword,
      username: testUsername,
      gender: 'female',
      age: 30
    });
    
    assert(result.status === 400, `Expected 400, got ${result.status}`);
  });

  await test('User Login - Valid', async () => {
    const result = await apiRequest('POST', '/api/users/login', {
      identifier: testEmail,
      password: testPassword
    });
    
    assert(result.status === 200, `Expected 200, got ${result.status}: ${JSON.stringify(result.error)}`);
    assert(result.data.session, 'No session returned');
    assert(result.data.session.access_token, 'No JWT token');
    authToken = result.data.session.access_token;
  });

  await test('User Login - Invalid Password (should fail)', async () => {
    const result = await apiRequest('POST', '/api/users/login', {
      identifier: testEmail,
      password: 'WrongPassword'
    });
    
    assert(result.status === 400, `Expected 400, got ${result.status}`);
  });

  await test('User Login - Non-existent User (should fail)', async () => {
    const result = await apiRequest('POST', '/api/users/login', {
      identifier: 'nonexistent@example.com',
      password: testPassword
    });
    
    assert(result.status === 400, `Expected 400, got ${result.status}`);
  });

  // ─────────────────────────────────────────────────────────────
  // SECTION 3: SESSION MANAGEMENT
  // ─────────────────────────────────────────────────────────────

  await test('Get Sessions - No Auth (should fail)', async () => {
    const result = await apiRequest('GET', '/api/sessions');
    assert(result.status === 401 || result.status === 500, `Expected 401/500, got ${result.status}`);
  });

  await test('Get Sessions - With Auth', async () => {
    const result = await apiRequest('GET', '/api/sessions', null, {
      'Authorization': `Bearer ${authToken}`
    });
    
    assert(result.success, `Error: ${JSON.stringify(result.error)}`);
    assert(Array.isArray(result.data.sessions), 'Sessions should be array');
  });

  await test('Create Session', async () => {
    const result = await apiRequest('POST', '/api/sessions', 
      { title: 'Test Session' },
      { 'Authorization': `Bearer ${authToken}` }
    );
    
    assert(result.success, `Error: ${JSON.stringify(result.error)}`);
    assert(result.data.session, 'No session returned');
    assert(result.data.session.id, 'No session ID');
    testSessionId = result.data.session.id;
  });

  // ─────────────────────────────────────────────────────────────
  // SECTION 4: TEXT PROCESSING & EMOTION DETECTION
  // ─────────────────────────────────────────────────────────────

  await test('Process Text - Happy message', async () => {
    const result = await apiRequest('POST', '/api/data/process', 
      {
        type: 'text',
        text: 'I am so happy and excited about my new job!'
      },
      { 'Authorization': `Bearer ${authToken}` }
    );
    
    assert(result.success, `Error: ${JSON.stringify(result.error)}`);
    assert(result.data.data, 'No response data');
    assert(result.data.data.emotion, 'No emotion detected');
    console.log(`   Detected emotion: ${result.data.data.emotion} (confidence: ${(result.data.data.emotionConfidence * 100).toFixed(1)}%)`);
  });

  await test('Process Text - Sad message', async () => {
    const result = await apiRequest('POST', '/api/data/process',
      {
        type: 'text',
        text: 'I feel really sad and depressed today'
      },
      { 'Authorization': `Bearer ${authToken}` }
    );
    
    assert(result.success, `Error: ${JSON.stringify(result.error)}`);
    assert(result.data.data.emotion, 'No emotion detected');
    console.log(`   Detected emotion: ${result.data.data.emotion} (confidence: ${(result.data.data.emotionConfidence * 100).toFixed(1)}%)`);
  });

  await test('Process Text - Angry message', async () => {
    const result = await apiRequest('POST', '/api/data/process',
      {
        type: 'text',
        text: 'This is absolutely infuriating! I am so angry!'
      },
      { 'Authorization': `Bearer ${authToken}` }
    );
    
    assert(result.success, `Error: ${JSON.stringify(result.error)}`);
    assert(result.data.data.emotion, 'No emotion detected');
    console.log(`   Detected emotion: ${result.data.data.emotion} (confidence: ${(result.data.data.emotionConfidence * 100).toFixed(1)}%)`);
  });

  await test('Process Text - Fearful message', async () => {
    const result = await apiRequest('POST', '/api/data/process',
      {
        type: 'text',
        text: 'I am terrified and anxious about everything'
      },
      { 'Authorization': `Bearer ${authToken}` }
    );
    
    assert(result.success, `Error: ${JSON.stringify(result.error)}`);
    assert(result.data.data.emotion, 'No emotion detected');
    console.log(`   Detected emotion: ${result.data.data.emotion} (confidence: ${(result.data.data.emotionConfidence * 100).toFixed(1)}%)`);
  });

  // ─────────────────────────────────────────────────────────────
  // SECTION 5: CRISIS DETECTION
  // ─────────────────────────────────────────────────────────────

  await test('Crisis Detection - MODERATE severity', async () => {
    const result = await apiRequest('POST', '/api/data/process',
      {
        type: 'text',
        text: 'I am feeling very stressed and anxious'
      },
      { 'Authorization': `Bearer ${authToken}` }
    );
    
    assert(result.success, `Error: ${JSON.stringify(result.error)}`);
    const data = result.data.data;
    if (data.isCrisis) {
      console.log(`   ⚠️  Crisis detected - Severity: ${data.severity}`);
      assert(['MODERATE', 'SEVERE', 'CRITICAL'].includes(data.severity), 'Invalid severity level');
    } else {
      console.log(`   ✓ No crisis detected (as expected for this message)`);
    }
  });

  await test('Crisis Detection - SEVERE severity', async () => {
    const result = await apiRequest('POST', '/api/data/process',
      {
        type: 'text',
        text: 'I am completely hopeless and feel unbearable pain'
      },
      { 'Authorization': `Bearer ${authToken}` }
    );
    
    assert(result.success, `Error: ${JSON.stringify(result.error)}`);
    const data = result.data.data;
    assert(data.isCrisis === true, 'Should detect crisis for severe keywords');
    assert(data.severity === 'SEVERE', `Expected SEVERE, got ${data.severity}`);
    console.log(`   🚨 Crisis detected - Severity: SEVERE`);
  });

  await test('Crisis Detection - CRITICAL severity', async () => {
    const result = await apiRequest('POST', '/api/data/process',
      {
        type: 'text',
        text: 'I want to kill myself and end my life right now'
      },
      { 'Authorization': `Bearer ${authToken}` }
    );
    
    assert(result.success, `Error: ${JSON.stringify(result.error)}`);
    const data = result.data.data;
    assert(data.isCrisis === true, 'Should detect crisis');
    assert(data.severity === 'CRITICAL', `Expected CRITICAL, got ${data.severity}`);
    assert(data.resources && data.resources.length > 0, 'Should include crisis resources');
    console.log(`   🚨🚨 CRITICAL CRISIS DETECTED`);
    console.log(`   Resources provided: ${data.resources.length} hotlines`);
  });

  // ─────────────────────────────────────────────────────────────
  // SECTION 6: AI RESPONSE VALIDATION
  // ─────────────────────────────────────────────────────────────

  await test('AI Response - Contains valid data', async () => {
    const result = await apiRequest('POST', '/api/data/process',
      {
        type: 'text',
        text: 'I am facing challenges'
      },
      { 'Authorization': `Bearer ${authToken}` }
    );
    
    assert(result.success, `Error: ${JSON.stringify(result.error)}`);
    const data = result.data.data;
    assert(data.response, 'No response text');
    assert(data.emotion, 'No emotion');
    assert(typeof data.emotionConfidence === 'number', 'Invalid confidence');
    assert(data.suggestions || data.guidedNextSteps, 'No suggestions or steps');
  });

  // ─────────────────────────────────────────────────────────────
  // SECTION 7: STREAMING (SSE)
  // ─────────────────────────────────────────────────────────────

  await test('Streaming Response - SSE headers', async () => {
    try {
      const response = await axios.post(`${BASE_URL}/api/data/process?stream=true`,
        {
          type: 'text',
          text: 'Test streaming'
        },
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      assert(response.headers['content-type'].includes('text/event-stream'), 'Not SSE stream');
      console.log(`   Stream headers valid - Content-Type: ${response.headers['content-type']}`);
    } catch (error) {
      throw new Error(`Streaming failed: ${error.message}`);
    }
  });

  // ─────────────────────────────────────────────────────────────
  // SECTION 8: ERROR HANDLING
  // ─────────────────────────────────────────────────────────────

  await test('Invalid Request - Missing required fields', async () => {
    const result = await apiRequest('POST', '/api/data/process',
      {
        type: 'text'
        // Missing 'text' field
      },
      { 'Authorization': `Bearer ${authToken}` }
    );
    
    assert(result.status === 400, `Expected 400, got ${result.status}`);
  });

  await test('Invalid Request - Invalid type', async () => {
    const result = await apiRequest('POST', '/api/data/process',
      {
        type: 'invalid',
        text: 'test'
      },
      { 'Authorization': `Bearer ${authToken}` }
    );
    
    assert(result.status === 400, `Expected 400, got ${result.status}`);
  });

  // ─────────────────────────────────────────────────────────────
  // PRINT RESULTS
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
  console.log(failCount === 0 ? '🎉 ALL TESTS PASSED!' : `⚠️  ${failCount} test(s) failed`);
  console.log('═'.repeat(70));
}

// Run tests
runTests().catch(console.error);
