const axios = require('axios');

// Test registration endpoint
async function testRegistration() {
  try {
    console.log('Testing user registration...');
    
    const testUser = {
      username: 'testuser' + Date.now(),
      email: 'test' + Date.now() + '@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    };

    const response = await axios.post('http://localhost:5000/api/auth/register', testUser);
    
    if (response.data.success) {
      console.log('✅ Registration successful!');
      console.log('User:', response.data.data.user.username);
      console.log('Token received:', !!response.data.data.token);
    } else {
      console.log('❌ Registration failed:', response.data.message);
    }
  } catch (error) {
    console.error('❌ Registration error:', error.response?.data || error.message);
  }
}

// Test login endpoint
async function testLogin() {
  try {
    console.log('\nTesting user login...');
    
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    const response = await axios.post('http://localhost:5000/api/auth/login', loginData);
    
    if (response.data.success) {
      console.log('✅ Login successful!');
      console.log('User:', response.data.data.user.username);
      console.log('Token received:', !!response.data.data.token);
    } else {
      console.log('❌ Login failed:', response.data.message);
    }
  } catch (error) {
    console.error('❌ Login error:', error.response?.data || error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting API tests...\n');
  
  await testRegistration();
  await testLogin();
  
  console.log('\n✨ Tests completed!');
}

// Check if server is running
async function checkServer() {
  try {
    const response = await axios.get('http://localhost:5000/api/health');
    console.log('✅ Server is running:', response.data.message);
    return true;
  } catch (error) {
    console.error('❌ Server is not running. Please start the server with: npm run dev');
    return false;
  }
}

// Main execution
async function main() {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await runTests();
  }
}

main(); 