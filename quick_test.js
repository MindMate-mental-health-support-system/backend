#!/usr/bin/env node

/**
 * SIMPLE SERVER STARTUP TEST
 */

const { spawn } = require('child_process');
const http = require('http');

async function test() {
  console.log('Spawning server...');
  const server = spawn('node', ['server.js'], {
    cwd: __dirname,
    stdio: 'inherit'
  });

  // Wait 3 seconds for server to start
  await new Promise(r => setTimeout(r, 3000));

  // Try to connect
  console.log('\nAttempting connection to localhost:5000...');
  http.get('http://localhost:5000/health', (res) => {
    console.log('✅ Server is responding! Status:', res.statusCode);
    server.kill();
    process.exit(0);
  }).on('error', (err) => {
    console.error('❌ Connection failed:', err.code);
    server.kill();
    process.exit(1);
  });
}

test().catch(console.error);
