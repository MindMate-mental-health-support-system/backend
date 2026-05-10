const http = require('http');

async function testAuth() {
    const user = {
        email: `test_${Date.now()}@test.com`,
        password: 'Password123!',
        username: `testuser_${Date.now()}`,
        age: 30,
        gender: 'M'
    };

    console.log("Signing up...", user);
    let signupRes = await fetch('http://localhost:5000/api/users/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    });
    console.log("Signup status:", signupRes.status);
    console.log("Signup body:", await signupRes.json());

    console.log("Logging in...");
    let loginRes = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: user.email, password: user.password })
    });
    console.log("Login status:", loginRes.status);
    console.log("Login body:", await loginRes.json());
}

testAuth();
