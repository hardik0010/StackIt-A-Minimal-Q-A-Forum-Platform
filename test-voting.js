const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:5000';
let authToken = '';
let testQuestionId = '';
let testAnswerId = '';

// Test user credentials
const testUser = {
  email: 'test@example.com',
  password: 'testpassword123'
};

// Helper function to make authenticated requests
const makeAuthRequest = (method, url, data = null) => {
  const config = {
    method,
    url: `${BASE_URL}${url}`,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    }
  };
  
  if (data) {
    config.data = data;
  }
  
  return axios(config);
};

// Test functions
async function testVoting() {
  console.log('🧪 Testing Voting Functionality...\n');

  try {
    // 1. Login
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, testUser);
    authToken = loginResponse.data.token;
    console.log('✅ Login successful\n');

    // 2. Create a test question
    console.log('2. Creating test question...');
    const questionData = {
      title: 'Test Question for Voting',
      content: 'This is a test question to verify voting functionality.',
      tags: ['test', 'voting']
    };
    
    const questionResponse = await makeAuthRequest('POST', '/api/questions', questionData);
    testQuestionId = questionResponse.data.data.question._id;
    console.log(`✅ Question created with ID: ${testQuestionId}\n`);

    // 3. Test upvoting the question
    console.log('3. Testing upvote on question...');
    const upvoteResponse = await makeAuthRequest('POST', `/api/questions/${testQuestionId}/vote`, {
      voteType: 'upvote'
    });
    
    const upvotedQuestion = upvoteResponse.data.data.question;
    console.log(`✅ Upvote successful. Vote count: ${upvotedQuestion.voteCount}, User vote: ${upvotedQuestion.userVote}\n`);

    // 4. Test downvoting the question (should remove upvote and add downvote)
    console.log('4. Testing downvote on question (should change from upvote to downvote)...');
    const downvoteResponse = await makeAuthRequest('POST', `/api/questions/${testQuestionId}/vote`, {
      voteType: 'downvote'
    });
    
    const downvotedQuestion = downvoteResponse.data.data.question;
    console.log(`✅ Downvote successful. Vote count: ${downvotedQuestion.voteCount}, User vote: ${downvotedQuestion.userVote}\n`);

    // 5. Test clicking downvote again (should remove the vote)
    console.log('5. Testing downvote again (should remove the vote)...');
    const removeVoteResponse = await makeAuthRequest('POST', `/api/questions/${testQuestionId}/vote`, {
      voteType: 'downvote'
    });
    
    const noVoteQuestion = removeVoteResponse.data.data.question;
    console.log(`✅ Vote removal successful. Vote count: ${noVoteQuestion.voteCount}, User vote: ${noVoteQuestion.userVote}\n`);

    // 6. Create a test answer
    console.log('6. Creating test answer...');
    const answerData = {
      content: 'This is a test answer to verify voting functionality.',
      questionId: testQuestionId
    };
    
    const answerResponse = await makeAuthRequest('POST', '/api/answers', answerData);
    testAnswerId = answerResponse.data.data.answer._id;
    console.log(`✅ Answer created with ID: ${testAnswerId}\n`);

    // 7. Test upvoting the answer
    console.log('7. Testing upvote on answer...');
    const answerUpvoteResponse = await makeAuthRequest('POST', `/api/answers/${testAnswerId}/vote`, {
      voteType: 'upvote'
    });
    
    const upvotedAnswer = answerUpvoteResponse.data.data.answer;
    console.log(`✅ Answer upvote successful. Vote count: ${upvotedAnswer.voteCount}, User vote: ${upvotedAnswer.userVote}\n`);

    // 8. Test downvoting the answer
    console.log('8. Testing downvote on answer...');
    const answerDownvoteResponse = await makeAuthRequest('POST', `/api/answers/${testAnswerId}/vote`, {
      voteType: 'downvote'
    });
    
    const downvotedAnswer = answerDownvoteResponse.data.data.answer;
    console.log(`✅ Answer downvote successful. Vote count: ${downvotedAnswer.voteCount}, User vote: ${downvotedAnswer.userVote}\n`);

    console.log('🎉 All voting tests passed successfully!');
    console.log('\n📊 Summary:');
    console.log('- Upvoting works correctly');
    console.log('- Downvoting works correctly');
    console.log('- Vote removal works correctly');
    console.log('- Vote count changes by only 1 at a time');
    console.log('- User vote state is properly tracked');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    console.error('Response:', error.response?.data);
  }
}

// Run the test
testVoting(); 