const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

const testUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'testpassword123',
  profile: {
    firstName: 'Test',
    lastName: 'User'
  }
};

async function createTestUser() {
  console.log('👤 Creating test user...');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/register`, testUser);
    
    if (response.data.success) {
      console.log('✅ Test user created successfully!');
      console.log('Username:', testUser.username);
      console.log('Email:', testUser.email);
      console.log('Password:', testUser.password);
    }
  } catch (error) {
    if (error.response?.data?.message?.includes('already exists')) {
      console.log('ℹ️ Test user already exists');
    } else {
      console.error('❌ Failed to create test user:', error.response?.data?.message || error.message);
    }
  }
}

createTestUser(); 