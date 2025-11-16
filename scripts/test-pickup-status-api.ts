async function testPickupStatusAPI() {
  console.log('🧪 Testing Pickup Status API...\n');

  const testUrl = process.env.TEST_URL || 'http://localhost:7000';
  const apiUrl = `${testUrl}/pickup-status`;

  console.log(`📋 Test Configuration:`);
  console.log(`   API URL: ${apiUrl}\n`);

  try {
    console.log('🚀 Sending GET request to pickup-status...');
    
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
      if (response.status === 500) {
        console.log(`\n⚠️  Server error. Make sure the dev server is running with: npm run dev`);
      }
      process.exit(1);
    }

    const data = await response.json();
    console.log(`\n✅ Response Body:`);
    console.log(JSON.stringify(data, null, 2));

    if (response.status === 200 && 'status' in data) {
      console.log(`\n✨ Test passed! API correctly returned 200 with status field.`);
      console.log(`   Status: ${data.status}`);
      if (data.pickup_id) {
        console.log(`   Pickup ID: ${data.pickup_id}`);
      }
    } else {
      console.log(`\n❌ Test failed: Expected 200 status with 'status' field`);
      if (response.status !== 200) {
        console.log(`   Got status code: ${response.status}`);
      }
      if (!('status' in data)) {
        console.log(`   Missing 'status' field in response`);
      }
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
testPickupStatusAPI().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});

export { testPickupStatusAPI };

