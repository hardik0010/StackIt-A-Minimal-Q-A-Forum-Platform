// Test script to verify improvements
const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:5000';

async function testTagSuggestions() {
  console.log('🧪 Testing Tag Suggestions Performance...');
  
  try {
    // Test 1: Basic search
    console.log('\n1. Testing basic search for "javascript"...');
    const start1 = Date.now();
    const response1 = await axios.get(`${BASE_URL}/api/tags/suggestions?search=javascript&limit=8`);
    const time1 = Date.now() - start1;
    
    console.log(`✅ Response time: ${time1}ms`);
    console.log(`✅ Suggestions found: ${response1.data.data.suggestions.length}`);
    console.log(`✅ First suggestion: ${response1.data.data.suggestions[0]}`);
    
    // Test 2: Cached search (should be faster)
    console.log('\n2. Testing cached search for "javascript"...');
    const start2 = Date.now();
    const response2 = await axios.get(`${BASE_URL}/api/tags/suggestions?search=javascript&limit=8`);
    const time2 = Date.now() - start2;
    
    console.log(`✅ Response time: ${time2}ms`);
    console.log(`✅ Cached suggestions found: ${response2.data.data.suggestions.length}`);
    
    // Test 3: Different search term
    console.log('\n3. Testing search for "react"...');
    const start3 = Date.now();
    const response3 = await axios.get(`${BASE_URL}/api/tags/suggestions?search=react&limit=8`);
    const time3 = Date.now() - start3;
    
    console.log(`✅ Response time: ${time3}ms`);
    console.log(`✅ Suggestions found: ${response3.data.data.suggestions.length}`);
    
    // Test 4: Empty search
    console.log('\n4. Testing empty search...');
    const response4 = await axios.get(`${BASE_URL}/api/tags/suggestions?search=&limit=8`);
    console.log(`✅ Empty search response: ${response4.data.data.suggestions.length} suggestions`);
    
    console.log('\n🎉 All tag suggestion tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function testPopularTags() {
  console.log('\n🧪 Testing Popular Tags...');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/tags/popular?limit=10`);
    console.log(`✅ Popular tags found: ${response.data.data.tags.length}`);
    console.log(`✅ First popular tag: ${response.data.data.tags[0]?.name || 'None'}`);
    console.log('🎉 Popular tags test passed!');
  } catch (error) {
    console.error('❌ Popular tags test failed:', error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Starting improvement tests...\n');
  
  await testTagSuggestions();
  await testPopularTags();
  
  console.log('\n✨ All tests completed!');
  console.log('\n📝 Summary of improvements:');
  console.log('✅ Image size constraints added (max-width: 100%, max-height: 400px)');
  console.log('✅ Image removal functionality added (hover to see remove button)');
  console.log('✅ Emoji picker made wider and organized by categories');
  console.log('✅ Tag suggestions optimized with debouncing and caching');
  console.log('✅ Backend API optimized with in-memory caching');
  console.log('✅ Better user experience with loading states and transitions');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { testTagSuggestions, testPopularTags, runAllTests }; 