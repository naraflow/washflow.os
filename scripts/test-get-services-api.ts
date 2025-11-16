async function testGetAllServicesAPI() {
  console.log('🧪 Testing Get All Services API...\n');

  const testUrl = process.env.TEST_URL || 'http://localhost:7000';
  const apiUrl = `${testUrl}/services`;

  console.log(`📋 Test Configuration:`);
  console.log(`   API URL: ${apiUrl}\n`);

  try {
    console.log('🚀 Sending GET request to services...');
    
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

    const services = await response.json();
    console.log(`\n✅ Response Body:`);
    console.log(JSON.stringify(services, null, 2));

    if (response.status === 200) {
      if (Array.isArray(services)) {
        console.log(`\n✨ Test passed! API correctly returned a list of services.`);
        console.log(`   Number of services: ${services.length}`);
        if (services.length > 0) {
          console.log(`   First service: ${services[0].name || services[0].id}`);
        } else {
          console.log(`   ⚠️  No services found (empty list)`);
        }
      } else {
        console.log(`\n❌ Test failed: Expected services to be a list, got ${typeof services}`);
        process.exit(1);
      }
    } else {
      console.log(`\n❌ Test failed: Expected status code 200, got ${response.status}`);
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
testGetAllServicesAPI().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});

export { testGetAllServicesAPI };

