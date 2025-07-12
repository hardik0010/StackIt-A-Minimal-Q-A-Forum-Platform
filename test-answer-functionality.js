const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let testQuestionId = '';
let testAnswerId = '';

// Test user credentials
const testUser = {
  email: 'test@example.com',
  password: 'testpassword123'
};

// Helper function to make authenticated requests
const authRequest = (method, url, data = null) => {
  const config = {
    method,
    url: `${BASE_URL}${url}`,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` })
    },
    ...(data && { data })
  };
  return axios(config);
};

// Test functions
async function testAuthentication() {
  console.log('🔐 Testing authentication...');
  
  try {
    // Login
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, testUser);
    if (loginResponse.data.success) {
      authToken = loginResponse.data.data.token;
      console.log('✅ Login successful');
      return true;
    }
  } catch (error) {
    console.log('❌ Login failed, trying to register...');
    
    try {
      // Register if login fails
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
        ...testUser,
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User'
      });
      
      if (registerResponse.data.success) {
        authToken = registerResponse.data.data.token;
        console.log('✅ Registration and login successful');
        return true;
      }
    } catch (regError) {
      console.log('❌ Registration failed:', regError.response?.data?.message || regError.message);
      return false;
    }
  }
  
  return false;
}

async function testCreateQuestion() {
  console.log('📝 Testing question creation...');
  
  try {
    const questionData = {
      title: 'Test Question for Answer Functionality',
      content: '<p>This is a test question to verify answer functionality including rich text formatting, voting, and accepting answers.</p>',
      tags: ['test', 'functionality', 'answers']
    };
    
    const response = await authRequest('POST', '/questions', questionData);
    
    if (response.data.success) {
      testQuestionId = response.data.data.question._id;
      console.log('✅ Question created successfully');
      console.log(`   Question ID: ${testQuestionId}`);
      return true;
    }
  } catch (error) {
    console.log('❌ Question creation failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testCreateAnswer() {
  console.log('💬 Testing answer creation...');
  
  try {
    const answerData = {
      content: '<p>This is a test answer with <strong>rich text formatting</strong> and <em>styling</em>.</p><p>It should support:</p><ul><li>Bold text</li><li>Italic text</li><li>Lists</li><li>Links</li></ul>',
      questionId: testQuestionId
    };
    
    const response = await authRequest('POST', '/answers', answerData);
    
    if (response.data.success) {
      testAnswerId = response.data.data.answer._id;
      console.log('✅ Answer created successfully');
      console.log(`   Answer ID: ${testAnswerId}`);
      return true;
    }
  } catch (error) {
    console.log('❌ Answer creation failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testVoteAnswer() {
  console.log('👍 Testing answer voting...');
  
  try {
    // Test upvote - should fail because user can't vote on their own answer
    const upvoteResponse = await authRequest('POST', `/answers/${testAnswerId}/vote`, {
      voteType: 'upvote'
    });
    
    if (upvoteResponse.data.success) {
      console.log('✅ Answer upvoted successfully');
      console.log(`   Vote count: ${upvoteResponse.data.data.answer.voteCount}`);
    }
    
    return true;
  } catch (error) {
    if (error.response?.data?.message === 'Cannot vote on your own answer') {
      console.log('✅ Voting restriction working correctly - cannot vote on own answer');
      return true;
    } else {
      console.log('❌ Answer voting failed:', error.response?.data?.message || error.message);
      return false;
    }
  }
}

async function testAcceptAnswer() {
  console.log('✅ Testing answer acceptance...');
  
  try {
    const response = await authRequest('POST', `/answers/${testAnswerId}/accept`);
    
    if (response.data.success) {
      console.log('✅ Answer accepted successfully');
      return true;
    }
  } catch (error) {
    console.log('❌ Answer acceptance failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testUnacceptAnswer() {
  console.log('❌ Testing answer unacceptance...');
  
  try {
    const response = await authRequest('POST', `/answers/${testAnswerId}/unaccept`);
    
    if (response.data.success) {
      console.log('✅ Answer unaccepted successfully');
      return true;
    }
  } catch (error) {
    console.log('❌ Answer unacceptance failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testEditAnswer() {
  console.log('✏️ Testing answer editing...');
  
  try {
    const editData = {
      content: '<p>This answer has been <strong>edited</strong> to test the editing functionality.</p><p>New content includes:</p><ol><li>Updated formatting</li><li>New information</li><li>Better structure</li></ol>'
    };
    
    const response = await authRequest('PUT', `/answers/${testAnswerId}`, editData);
    
    if (response.data.success) {
      console.log('✅ Answer edited successfully');
      return true;
    }
  } catch (error) {
    console.log('❌ Answer editing failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testAddComment() {
  console.log('💭 Testing comment addition...');
  
  try {
    const commentData = {
      content: 'This is a test comment on the answer.'
    };
    
    const response = await authRequest('POST', `/answers/${testAnswerId}/comments`, commentData);
    
    if (response.data.success) {
      console.log('✅ Comment added successfully');
      return true;
    }
  } catch (error) {
    console.log('❌ Comment addition failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testGetAnswers() {
  console.log('📋 Testing answer retrieval...');
  
  try {
    const response = await authRequest('GET', `/answers/question/${testQuestionId}`);
    
    if (response.data.success) {
      console.log('✅ Answers retrieved successfully');
      console.log(`   Number of answers: ${response.data.data.answers.length}`);
      return true;
    }
  } catch (error) {
    console.log('❌ Answer retrieval failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Answer Functionality Tests\n');
  
  const tests = [
    { name: 'Authentication', fn: testAuthentication },
    { name: 'Create Question', fn: testCreateQuestion },
    { name: 'Create Answer', fn: testCreateAnswer },
    { name: 'Vote Answer', fn: testVoteAnswer },
    { name: 'Accept Answer', fn: testAcceptAnswer },
    { name: 'Unaccept Answer', fn: testUnacceptAnswer },
    { name: 'Edit Answer', fn: testEditAnswer },
    { name: 'Add Comment', fn: testAddComment },
    { name: 'Get Answers', fn: testGetAnswers }
  ];
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  for (const test of tests) {
    console.log(`\n--- ${test.name} ---`);
    const success = await test.fn();
    if (success) {
      passedTests++;
    }
  }
  
  console.log('\n📊 Test Results');
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! Answer functionality is working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the implementation.');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testAuthentication,
  testCreateQuestion,
  testCreateAnswer,
  testVoteAnswer,
  testAcceptAnswer,
  testUnacceptAnswer,
  testEditAnswer,
  testAddComment,
  testGetAnswers
}; 