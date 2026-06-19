// test-endpoint.js - Run this to check if your endpoint works
// Save this in your server folder and run: node test-endpoint.js

const http = require('http');

// Test 1: Check if server is running
console.log('\n🔍 Testing Backend Endpoints\n');
console.log('==================================');

// Test GET request
const options = {
  hostname: 'localhost',
  port: 8080,
  path: '/api/applications',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

console.log('Test 1: GET /api/applications');
console.log('URL: http://localhost:8080/api/applications');

const req = http.request(options, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Status Message:', res.statusMessage);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
    console.log('==================================\n');
    
    if (res.statusCode === 404) {
      console.log('❌ PROBLEM: Route not found!');
      console.log('\nThis means:');
      console.log('1. Server is running ✅');
      console.log('2. But /api/applications route is NOT registered ❌');
      console.log('\nFix:');
      console.log('- Check server/index.js has:');
      console.log('  app.use(\'/api/applications\', applicationRoutes);');
    } else if (res.statusCode === 401) {
      console.log('✅ Route exists! (401 = needs authentication)');
    } else {
      console.log('✅ Route works!');
    }
  });
});

req.on('error', (e) => {
  console.error('❌ ERROR:', e.message);
  console.log('\nThis means:');
  console.log('- Server is NOT running on port 8080');
  console.log('- Or wrong port/hostname');
});

req.end();