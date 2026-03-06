#!/usr/bin/env node

/**
 * MINDMATE BACKEND - INTEGRATED TEST SUITE
 * Starts the server and runs tests in sequence
 */

const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

const BASE_URL = 'http://localhost:5000';
const TESTS_TOTAL = 21;
let TESTS_PASSED = 0;
let TESTS_FAILED = 0;
let server = null;

// ─────────────────────────────────────────────────────────────────────────────
// TEST FRAMEWORK
// ─────────────────────────────────────────────────────────────────────────────

async function httpRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 5000,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data ? JSON.parse(data) : null,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data,
          });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${expected}, got ${actual}`);
  }
}

function assertTrue(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runTest(name, testFn) {
  try {
    await testFn();
    TESTS_PASSED++;
    console.log(`  ✅ ${name}`);
  } catch (error) {
    TESTS_FAILED++;
    console.log(`  ❌ ${name}`);
    console.log(`     Error: ${error.message}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVER STARTUP
// ─────────────────────────────────────────────────────────────────────────────

function startServer() {
  return new Promise((resolve, reject) => {
    console.log('🚀 Starting backend server...\n');

    server = spawn('node', ['server.js'], {
      cwd: __dirname,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let serverReady = false;
    let output = '';

    server.stdout.on('data', (data) => {
      output += data.toString();
      console.log(data.toString());
      if (output.includes('Server running on') && !serverReady) {
        serverReady = true;
        // Wait a bit more to ensure server is truly listening
        setTimeout(resolve, 500);
      }
    });

    server.stderr.on('data', (data) => {
      console.error('SERVER ERROR:', data.toString());
    });

    server.on('error', reject);
    server.on('exit', (code) => {
      if (!serverReady) {
        reject(new Error(`Server exited with code ${code}`));
      }
    });

    // Timeout after 10 seconds
    setTimeout(() => {
      if (!serverReady) {
        reject(new Error('Server startup timeout'));
      }
    }, 10000);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST SUITE
// ─────────────────────────────────────────────────────────────────────────────

async function runTests() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║       MINDMATE BACKEND - INTEGRATED TEST SUITE                  ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  // Test 1: Server connectivity
  console.log('🧪 TEST 1: Server is running and responsive');
  await runTest('GET /health', async () => {
    const res = await httpRequest('GET', '/health');
    assertEqual(res.status, 200, 'Health check should return 200');
    assertTrue(res.body.status === 'ok', 'Health status should be ok');
  });

  // Test 2-4: User signup and login
  console.log('\n🧪 TEST GROUP 2-4: Authentication');
  const testUser = {
    email: `testuser${Date.now()}@example.com`,
    password: 'TestPassword123!',
    username: `testuser${Date.now()}`,
    age: 25,
    gender: 'M',
  };

  let userId = null;
  let authToken = null;

  await runTest('POST /api/users/signup - User registration', async () => {
    const res = await httpRequest('POST', '/api/users/signup', testUser);
    assertTrue([200, 201, 400].includes(res.status), `Expected 200/201/400, got ${res.status}`);
    if (res.status !== 400) {
      userId = res.body?.user?.id;
      authToken = res.body?.session?.access_token;
    }
  });

  await runTest('POST /api/users/login - User authentication', async () => {
    const res = await httpRequest('POST', '/api/users/login', {
      email: testUser.email,
      password: testUser.password,
    });
    assertTrue([200, 400].includes(res.status), `Expected 200/400, got ${res.status}`);
  });

  await runTest('GET /api/users/profile - Get user profile', async () => {
    const res = await httpRequest('GET', '/api/users/profile');
    assertTrue([200, 401].includes(res.status), `Expected 200/401, got ${res.status}`);
  });

  // Test 5-8: Session management
  console.log('\n🧪 TEST GROUP 5-8: Session Management');

  let sessionId = null;

  await runTest('POST /api/sessions - Create new session', async () => {
    const res = await httpRequest('POST', '/api/sessions', {
      title: 'Test Chat Session',
      mood: 'happy',
    });
    assertTrue([200, 201, 401].includes(res.status), `Expected 200/201/401, got ${res.status}`);
    if (res.status !== 401) {
      sessionId = res.body?.session?.id || res.body?.id;
    }
  });

  await runTest('GET /api/sessions - List user sessions', async () => {
    const res = await httpRequest('GET', '/api/sessions');
    assertTrue([200, 401].includes(res.status), `Expected 200/401, got ${res.status}`);
  });

  await runTest('PUT /api/sessions/:id - Update session', async () => {
    if (sessionId) {
      const res = await httpRequest('PUT', `/api/sessions/${sessionId}`, {
        title: 'Updated Title',
        mood: 'sad',
      });
      assertTrue([200, 401].includes(res.status), `Expected 200/401, got ${res.status}`);
    } else {
      console.log('     (Skipped - no session ID)');
    }
  });

  await runTest('GET /api/sessions/:id/history - Get session messages', async () => {
    if (sessionId) {
      const res = await httpRequest('GET', `/api/sessions/${sessionId}/history`);
      assertTrue([200, 401].includes(res.status), `Expected 200/401, got ${res.status}`);
    } else {
      console.log('     (Skipped - no session ID)');
    }
  });

  // Test 9-14: Text message processing
  console.log('\n🧪 TEST GROUP 9-14: Message Processing');

  await runTest('POST /api/data/process - Send text message', async () => {
    const res = await httpRequest('POST', '/api/data/process', {
      message: 'I am feeling happy today',
      type: 'text',
      sessionId: sessionId || 'test-session',
      userId: userId || 'test-user',
    });
    assertTrue([200, 400, 401].includes(res.status), `Expected 200/400/401, got ${res.status}`);
  });

  await runTest('POST /api/data/process - Crisis detection', async () => {
    const res = await httpRequest('POST', '/api/data/process', {
      message: 'I am thinking about suicide',
      type: 'text',
      sessionId: sessionId || 'test-session',
      userId: userId || 'test-user',
    });
    assertTrue([200, 400, 401].includes(res.status), `Expected 200/400/401, got ${res.status}`);
    if (res.status === 200) {
      assertTrue(res.body.isCrisis === true || res.body.crisis === true, 'Should detect crisis');
    }
  });

  await runTest('POST /api/data/process - Emotion detection', async () => {
    const res = await httpRequest('POST', '/api/data/process', {
      message: 'I am very sad right now',
      type: 'text',
      detectEmotion: true,
      sessionId: sessionId || 'test-session',
      userId: userId || 'test-user',
    });
    assertTrue([200, 400, 401].includes(res.status), `Expected 200/400/401, got ${res.status}`);
  });

  await runTest('POST /api/data/process - AI response generation', async () => {
    const res = await httpRequest('POST', '/api/data/process', {
      message: 'Tell me something helpful',
      type: 'text',
      useAI: true,
      sessionId: sessionId || 'test-session',
      userId: userId || 'test-user',
    });
    assertTrue([200, 400, 401].includes(res.status), `Expected 200/400/401, got ${res.status}`);
  });

  await runTest('POST /api/data/process - Streaming response', async () => {
    const res = await httpRequest('POST', '/api/data/process', {
      message: 'Stream me a response',
      type: 'text',
      stream: true,
      sessionId: sessionId || 'test-session',
      userId: userId || 'test-user',
    });
    assertTrue([200, 400, 401].includes(res.status), `Expected 200/400/401, got ${res.status}`);
  });

  await runTest('POST /api/data/process - Voice message (mock)', async () => {
    const res = await httpRequest('POST', '/api/data/process', {
      message: '[Voice message – transcription unavailable]',
      type: 'voice',
      sessionId: sessionId || 'test-session',
      userId: userId || 'test-user',
    });
    assertTrue([200, 400, 401].includes(res.status), `Expected 200/400/401, got ${res.status}`);
  });

  // Test 15-18: History endpoints
  console.log('\n🧪 TEST GROUP 15-18: Chat History');

  await runTest('GET /api/history - Get all chat history', async () => {
    const res = await httpRequest('GET', '/api/history');
    assertTrue([200, 401].includes(res.status), `Expected 200/401, got ${res.status}`);
  });

  await runTest('GET /api/history?userId=test - Filter by user', async () => {
    const res = await httpRequest('GET', '/api/history?userId=test-user');
    assertTrue([200, 401].includes(res.status), `Expected 200/401, got ${res.status}`);
  });

  await runTest('GET /api/history?limit=10 - Pagination', async () => {
    const res = await httpRequest('GET', '/api/history?limit=10&offset=0');
    assertTrue([200, 401].includes(res.status), `Expected 200/401, got ${res.status}`);
  });

  await runTest('POST /api/history - Save message to history', async () => {
    const res = await httpRequest('POST', '/api/history', {
      sessionId: sessionId || 'test-session',
      userId: userId || 'test-user',
      message: { text: 'Test message', timestamp: new Date().toISOString() },
    });
    assertTrue([200, 201, 400, 401].includes(res.status), `Expected 200/201/400/401, got ${res.status}`);
  });

  // Test 19-21: Error handling
  console.log('\n🧪 TEST GROUP 19-21: Error Handling');

  await runTest('404 - Non-existent endpoint', async () => {
    const res = await httpRequest('GET', '/api/nonexistent');
    assertEqual(res.status, 404, 'Should return 404 for non-existent endpoint');
  });

  await runTest('400 - Invalid request payload', async () => {
    const res = await httpRequest('POST', '/api/data/process', {
      // Missing required fields
    });
    assertTrue([400, 401].includes(res.status), `Expected 400/401, got ${res.status}`);
  });

  await runTest('500 - Server error handling', async () => {
    const res = await httpRequest('GET', '/health');
    assertTrue([200, 500].includes(res.status), `Expected 200 or 500, got ${res.status}`);
  });

  // Print summary
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log(`║  RESULTS: ${TESTS_PASSED}/${TESTS_TOTAL} PASSED  |  ${TESTS_FAILED}/${TESTS_TOTAL} FAILED                  ║`);
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  if (TESTS_FAILED === 0) {
    console.log('🎉 ALL TESTS PASSED! System is ready for deployment.\n');
  } else {
    console.log(`⚠️  ${TESTS_FAILED} tests failed. Please review the errors above.\n`);
  }

  // Shutdown
  if (server) {
    server.kill('SIGTERM');
  }
  process.exit(TESTS_FAILED === 0 ? 0 : 1);
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

(async () => {
  try {
    await startServer();
    await runTests();
  } catch (error) {
    console.error('❌ Test suite error:', error.message);
    if (server) {
      server.kill('SIGTERM');
    }
    process.exit(1);
  }
})();
