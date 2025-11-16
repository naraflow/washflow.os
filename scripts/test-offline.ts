import { testSpriteClient } from '../src/lib/testsprite';

async function runOfflineTest() {
  console.log('🧪 Starting TestSprite offline test...\n');

  if (!testSpriteClient.isConfigured()) {
    console.error('❌ TestSprite API key not configured!');
    console.log('Please add VITE_TESTSPRITE_API_KEY to your .env file');
    process.exit(1);
  }

  const testUrl = process.env.TEST_URL || 'http://localhost:7000';
  
  console.log(`📋 Test Configuration:`);
  console.log(`   URL: ${testUrl}`);
  console.log(`   API Key: ${testSpriteClient.isConfigured() ? '✅ Configured' : '❌ Missing'}\n`);

  try {
    console.log('🚀 Running test...');
    const result = await testSpriteClient.runTest({
      url: testUrl,
      testName: 'Offline Error Inspection Test',
      instructions: `
        Perform comprehensive error inspection on the Washflow OS application:
        1. Navigate through all main pages
        2. Test form submissions
        3. Test navigation
        4. Check for console errors
        5. Test error boundaries
        6. Verify API error handling
      `,
      timeout: 60000,
      screenshots: true,
      video: true,
    });

    console.log(`\n✅ Test started successfully!`);
    console.log(`   Test ID: ${result.testId}`);
    console.log(`   Status: ${result.status}`);
    
    if (result.errors && result.errors.length > 0) {
      console.log(`\n⚠️  Found ${result.errors.length} errors:`);
      result.errors.forEach((error, index) => {
        console.log(`\n   Error ${index + 1}:`);
        console.log(`   Type: ${error.type}`);
        console.log(`   Message: ${error.message}`);
        if (error.stack) {
          console.log(`   Stack: ${error.stack.substring(0, 200)}...`);
        }
      });
    } else {
      console.log(`\n✨ No errors found!`);
    }

    console.log(`\n📊 Test completed in ${result.duration}ms`);
    
    if (result.video) {
      console.log(`📹 Video recording: ${result.video}`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run if called directly
runOfflineTest().catch(console.error);

export { runOfflineTest };

