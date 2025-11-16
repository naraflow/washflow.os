async function testCustomerDetailsAPI() {
  console.log('🧪 Testing Customer Details API...\n');

  const testUrl = process.env.TEST_URL || 'http://localhost:7000';
  const apiUrl = `${testUrl}/customers/details`;

  console.log(`📋 Test Configuration:`);
  console.log(`   API URL: ${apiUrl}\n`);

  // Test 1: Without ID (should return error)
  try {
    console.log('🚀 Test 1: Request without customer ID...');
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer sk-user-nFBcrppFcYh2ZeC8i3quM4ipVJPjwjl5GQ89g-NhRFFkjIucNHDHHckKCLo_XU0EzSR-DJjsKOOJwvIA4Bw1m8M9drBrN_Mz_I39eiuisT_1-CfCWi5E9XkXQNw5z90XtFU'
      }
    });

    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);

    const contentType = response.headers.get('content-type');
    console.log(`📄 Content-Type: ${contentType}`);

    if (!contentType?.includes('application/json')) {
      const text = await response.text();
      console.log(`\n❌ Non-JSON response received (Status: ${response.status}):`);
      console.log(text.substring(0, 500));
      process.exit(1);
    }

    const data = await response.json();
    console.log(`\n✅ Response Body:`);
    console.log(JSON.stringify(data, null, 2));

    if (response.status === 400 && !data.success) {
      console.log(`\n✨ Test 1 passed! API correctly returns error for missing ID.`);
    } else {
      console.log(`\n⚠️  Test 1: Unexpected response`);
    }

  } catch (error: any) {
    console.error('\n❌ Test 1 failed with error:', error.message);
    if (error.cause) {
      console.error('   Cause:', error.cause);
    }
    process.exit(1);
  }

  // Test 2: With ID (if you have a test customer ID)
  const testCustomerId = process.env.TEST_CUSTOMER_ID;
  if (testCustomerId) {
    try {
      console.log(`\n🚀 Test 2: Request with customer ID: ${testCustomerId}...`);
      
      const response = await fetch(`${apiUrl}?id=${testCustomerId}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer sk-user-nFBcrppFcYh2ZeC8i3quM4ipVJPjwjl5GQ89g-NhRFFkjIucNHDHHckKCLo_XU0EzSR-DJjsKOOJwvIA4Bw1m8M9drBrN_Mz_I39eiuisT_1-CfCWi5E9XkXQNw5z90XtFU'
        }
      });

      console.log(`📊 Response Status: ${response.status} ${response.statusText}`);

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        const text = await response.text();
        console.log(`\n❌ Non-JSON response received (Status: ${response.status}):`);
        console.log(text.substring(0, 500));
        process.exit(1);
      }

      const data = await response.json();
      console.log(`\n✅ Response Body:`);
      console.log(JSON.stringify(data, null, 2));

      if (response.ok && data.success) {
        console.log(`\n✨ Test 2 passed! Customer details retrieved successfully.`);
        console.log(`   Customer ID: ${data.data?.id}`);
        console.log(`   Customer Name: ${data.data?.name}`);
      } else if (response.status === 404) {
        console.log(`\n⚠️  Test 2: Customer not found (this is expected if the ID doesn't exist)`);
      } else {
        console.log(`\n❌ Test 2 failed: API returned error`);
        process.exit(1);
      }

    } catch (error: any) {
      console.error('\n❌ Test 2 failed with error:', error.message);
      process.exit(1);
    }
  } else {
    console.log(`\n⚠️  Test 2 skipped: Set TEST_CUSTOMER_ID environment variable to test with a customer ID`);
  }
}

// Run if called directly
testCustomerDetailsAPI().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});

export { testCustomerDetailsAPI };

