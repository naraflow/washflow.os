async function testInvalidEndpointAPI() {
  console.log('🧪 Testing Invalid Endpoint API...\n');

  const testUrl = process.env.TEST_URL || 'http://localhost:7000';
  const apiUrl = `${testUrl}/invalid-endpoint`;

  console.log(`📋 Test Configuration:`);
  console.log(`   API URL: ${apiUrl}\n`);

  try {
    console.log('🚀 Sending GET request to invalid endpoint...');
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer sk-user-nFBcrppFcYh2ZeC8i3quM4ipVJPjwjl5GQ89g-NhRFFkjIucNHDHHckKCLo_XU0EzSR-DJjsKOOJwvIA4Bw1m8M9drBrN_Mz_I39eiuisT_1-CfCWi5E9XkXQNw5z90XtFU'
      }
    });

    console.log(`\n📊 Response Status: ${response.status} ${response.statusText}`);

    const contentType = response.headers.get('content-type');
    console.log(`📄 Content-Type: ${contentType}`);

    if (!contentType?.includes('application/json')) {
      const text = await response.text();
      console.log(`\n❌ Non-JSON response received (Status: ${response.status}):`);
      console.log(text.substring(0, 500));
      if (response.status === 404) {
        console.log(`\n⚠️  Got 404 but response is not JSON. The endpoint should return JSON 404.`);
      }
      process.exit(1);
    }

    const data = await response.json();
    console.log(`\n✅ Response Body:`);
    console.log(JSON.stringify(data, null, 2));

    if (response.status === 404 && !data.success && data.error) {
      console.log(`\n✨ Test passed! API correctly returned 404 with JSON error message.`);
      console.log(`   Error: ${data.error}`);
      console.log(`   Path: ${data.path}`);
    } else if (response.status === 404) {
      console.log(`\n⚠️  Got 404 but response format is unexpected.`);
      console.log(`   Expected: { success: false, error: "...", path: "..." }`);
      process.exit(1);
    } else {
      console.log(`\n❌ Test failed: Expected 404 status, got ${response.status}`);
      process.exit(1);
    }

  } catch (error: any) {
    console.error('\n❌ Test failed with error:', error.message);
    if (error.cause) {
      console.error('   Cause:', error.cause);
    }
    process.exit(1);
  }
}

// Run if called directly
testInvalidEndpointAPI().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});

export { testInvalidEndpointAPI };

