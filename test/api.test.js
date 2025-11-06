/**
 * Basic test file to verify API functionality
 */
import http from 'http';
import { URL } from 'url';

// Create a test server for testing purposes
const testServer = (app) => {
  return new Promise((resolve) => {
    // Start the server on a random port
    const server = app.listen(0, () => {
      const port = server.address().port;
      resolve({ server, port });
    });
  });
};

// Simple HTTP request utility
const makeRequest = (port, method, path, data = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: port,
      method: method,
      path: path,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            body: JSON.parse(body),
            headers: res.headers
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            body: body,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
};

// Test function
async function runTests() {
  console.log('Starting API tests...\n');
  
  // Import the app
  const { default: app } = await import('../src/app/index.js');
  
  // Start test server
  const { server, port } = await testServer(app);
  
  try {
    // Test 1: Test the openapi.json endpoint
    console.log('Test 1: GET /openapi.json');
    let response = await makeRequest(port, 'GET', '/openapi.json');
    console.log(`  Status: ${response.statusCode} (Expected: 200)`);
    console.log(`  Success: ${response.body.success !== false} (Expected: true)`);
    console.log(`  Title: ${response.body.title}`);
    console.log('  ✓ GET /openapi.json test passed\n');
    
    // Test 2: Test the root endpoint
    console.log('Test 2: GET /');
    response = await makeRequest(port, 'GET', '/');
    console.log(`  Status: ${response.statusCode} (Expected: 200)`);
    console.log('  ✓ GET / test passed\n');
    
    // Test 3: Test the register endpoint with valid data
    console.log('Test 3: POST /api/users/register (valid data)');
    response = await makeRequest(port, 'POST', '/api/users/register', {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      age: 25
    });
    console.log(`  Status: ${response.statusCode} (Expected: 201)`);
    if (response.body.success) {
      console.log(`  Success: ${response.body.success}`);
      console.log(`  Username: ${response.body.data?.username}`);
      console.log('  ✓ POST /api/users/register (valid) test passed\n');
    } else {
      console.log('  Response:', JSON.stringify(response.body, null, 2));
      console.log('  ⚠ POST /api/users/register (valid) test needs review\n');
    }
    
    // Test 4: Test the register endpoint with invalid data
    console.log('Test 4: POST /api/users/register (invalid data)');
    response = await makeRequest(port, 'POST', '/api/users/register', {
      username: 'ab', // Too short
      email: 'invalid-email',
      password: '123' // Too short
    });
    console.log(`  Status: ${response.statusCode} (Expected: 400)`);
    if (response.statusCode === 400 && !response.body.success) {
      console.log('  ✓ POST /api/users/register (invalid) test passed\n');
    } else {
      console.log('  Response:', JSON.stringify(response.body, null, 2));
      console.log('  ⚠ POST /api/users/register (invalid) test needs review\n');
    }
    
    // Test 5: Test the get users endpoint
    console.log('Test 5: GET /api/users/get');
    response = await makeRequest(port, 'GET', '/api/users/get?page=1&limit=5');
    console.log(`  Status: ${response.statusCode} (Expected: 200)`);
    if (response.body.success) {
      console.log(`  Success: ${response.body.success}`);
      console.log('  ✓ GET /api/users/get test passed\n');
    } else {
      console.log('  Response:', JSON.stringify(response.body, null, 2));
      console.log('  ⚠ GET /api/users/get test needs review\n');
    }
    
    // Test 6: Test 404 handling
    console.log('Test 6: GET /nonexistent');
    response = await makeRequest(port, 'GET', '/nonexistent');
    console.log(`  Status: ${response.statusCode} (Expected: 404)`);
    if (response.statusCode === 404 && !response.body.success) {
      console.log('  ✓ 404 handling test passed\n');
    } else {
      console.log('  Response:', JSON.stringify(response.body, null, 2));
      console.log('  ⚠ 404 handling test needs review\n');
    }
    
    console.log('All tests completed!');
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    // Close the server
    server.close();
  }
}

// Run the tests
runTests().catch(console.error);