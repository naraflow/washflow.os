async function testUpdateServiceAPI() {
  console.log('🧪 Testing Update Service API...\n');

  const testUrl = process.env.TEST_URL || 'http://localhost:7000';
  const apiUrl = `${testUrl}/update_service`;

  console.log(`📋 Test Configuration:`);
  console.log(`   API URL: ${apiUrl}\n`);

  // First, we need to get or create a service to update
  // For testing, we'll try with a test service ID
  const testServiceId = process.env.TEST_SERVICE_ID || 'svc-12345';
  
  const updatePayload = {
    service_id: testServiceId,
    service_name: "Updated Laundry Service",
    price: 20.00,
    description: "Updated service description."
  };

  try {
    console.log('🚀 Sending PUT request to update_service...');
    console.log('📦 Request data:', JSON.stringify(updatePayload, null, 2));
    
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-user-nFBcrppFcYh2ZeC8i3quM4ipVJPjwjl5GQ89g-NhRFFkjIucNHDHHckKCLo_XU0EzSR-DJjsKOOJwvIA4Bw1m8M9drBrN_Mz_I39eiuisT_1-CfCWi5E9XkXQNw5z90XtFU'
      },
      body: JSON.stringify(updatePayload)
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

    if (response.ok && data.success) {
      console.log(`\n✨ Test passed! Service updated successfully.`);
      console.log(`   Service ID: ${data.data?.id}`);
      console.log(`   Service Name: ${data.data?.service_name}`);
      console.log(`   Price: ${data.data?.price}`);
    } else if (response.status === 404) {
      console.log(`\n⚠️  Service not found (Status: 404)`);
      console.log(`   This is expected if the service ID doesn't exist.`);
      console.log(`   To test with a real service, set TEST_SERVICE_ID environment variable.`);
    } else {
      console.log(`\n❌ Test failed: API returned error`);
      console.log(`   Error: ${data.error || 'Unknown error'}`);
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
testUpdateServiceAPI().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});

export { testUpdateServiceAPI };

